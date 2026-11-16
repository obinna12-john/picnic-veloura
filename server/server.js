import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase.js';
import { sendConfirmationEmail } from './utils/sendConfirmationEmail.js';
import { sendEventInformationEmail } from './utils/sendEventInformationEmail.js';

dotenv.config();

/* =========================
   ENVIRONMENT VARIABLES
========================= */

const requiredEnvVars = [
  'FRONTEND_URL',
  'PAYSTACK_SECRET_KEY',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_EMAIL',
];

for (const variable of requiredEnvVars) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is not configured.`);
  }
}

/* =========================
   SUPABASE AUTH CLIENT
========================= */

const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/* =========================
   APP
========================= */

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   ADMIN AUTHENTICATION
========================= */

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const token = authHeader
      .replace('Bearer ', '')
      .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is missing.',
      });
    }

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      console.error(
        'Admin token verification failed:',
        error?.message
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session.',
      });
    }

    if (
      !user.email ||
      user.email.toLowerCase() !==
        process.env.ADMIN_EMAIL.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required.',
      });
    }

    req.adminUser = user;

    next();

  } catch (error) {
    console.error(
      'Admin authentication error:',
      error
    );

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

/* =========================
   HOME
========================= */

app.get('/', (req, res) => {
  res.json({
    message:
      'Event Registration API is running',
  });
});

/* =========================
   EVENT INFORMATION EMAILS
========================= */

app.post(
  '/api/admin/send-event-information',
  requireAdmin,
  async (req, res) => {
    try {
      const {
        date,
        time,
        venue,
        colourCode,
      } = req.body;

      if (
        !date ||
        !time ||
        !venue ||
        !colourCode
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Date, time, venue and colour code are required.',
        });
      }

      const {
        data: participants,
        error,
      } = await supabase
        .from('participants')
        .select(`
          participant_id,
          full_name,
          email,
          level,
          area_of_interest
        `)
        .eq('payment_status', 'Paid');

      if (error) {
        console.error(
          'Error fetching participants:',
          error
        );

        return res.status(500).json({
          success: false,
          message:
            'Failed to fetch participants.',
        });
      }

      if (
        !participants ||
        participants.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            'No paid participants found.',
        });
      }

      const eventDetails = {
        date,
        time,
        venue,
        colourCode,
      };

      let successful = 0;
      let failed = 0;

      for (const participant of participants) {
        const result =
          await sendEventInformationEmail(
            participant,
            eventDetails
          );

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }

      return res.status(200).json({
        success: true,
        message:
          'Event information email process completed.',
        totalParticipants:
          participants.length,
        successful,
        failed,
      });

    } catch (error) {
      console.error(
        'Send event information error:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Failed to send event information emails.',
      });
    }
  }
);

/* =========================
   PAYSTACK
========================= */

/*
   STEP 1:
   Initialize Paystack transaction
*/

app.post(
  '/api/payment/initialize',
  async (req, res) => {
    try {
      const {
        email,
        fullName,
        level,
        areaOfInterest,
      } = req.body;

      if (
        !email ||
        !fullName ||
        !level ||
        !areaOfInterest
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Registration details are required.',
        });
      }

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,

          // ₦1,000 = 100,000 kobo
          amount: '100000',

          currency: 'NGN',

          callback_url:
            `${process.env.FRONTEND_URL}/payment`,

          metadata: {
            fullName,
            level,
            areaOfInterest,
          },
        },
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,

            'Content-Type':
              'application/json',
          },
        }
      );

      res.json({
        success: true,

        authorizationUrl:
          response.data.data.authorization_url,

        accessCode:
          response.data.data.access_code,

        reference:
          response.data.data.reference,
      });

    } catch (error) {
      console.error(
        'Paystack initialization error:',
        error.response?.data ||
          error.message
      );

      res.status(500).json({
        success: false,
        message:
          'Unable to initialize payment.',
      });
    }
  }
);

/*
   STEP 2:
   Verify Paystack transaction
*/

app.get(
  '/api/payment/verify/:reference',
  async (req, res) => {
    try {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            'Payment reference is required.',
        });
      }

      /*
        1. Verify payment with Paystack
      */

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization:
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const transaction =
        response.data.data;

      console.log(
        'Paystack transaction:',
        {
          reference:
            transaction.reference,
          status:
            transaction.status,
          amount:
            transaction.amount,
          currency:
            transaction.currency,
        }
      );

      /*
        2. Confirm payment was successful
      */

      if (
        transaction.status !== 'success'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Payment was not successful.',
          status:
            transaction.status,
        });
      }

      /*
        3. Confirm the registration fee
           was fully paid.

           ₦1,000 = 100,000 kobo.

           Paystack may add its transaction fee
           when fees are passed to the customer.

           Therefore, we reject only payments
           below ₦1,000.
      */

      const REGISTRATION_FEE = 100000;

      console.log(
        'Expected minimum amount:',
        REGISTRATION_FEE
      );

      console.log(
        'Amount returned by Paystack:',
        transaction.amount
      );

      if (
        transaction.amount <
        REGISTRATION_FEE
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid payment amount.',
          expectedMinimum:
            REGISTRATION_FEE,
          received:
            transaction.amount,
        });
      }

      /*
        4. Confirm currency
      */

      if (
        transaction.currency !== 'NGN'
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid payment currency.',
        });
      }

      /*
        5. Prevent duplicate payment processing
      */

      const {
        data: existingParticipant,
        error: existingError,
      } = await supabase
        .from('participants')
        .select('*')
        .eq(
          'paystack_reference',
          reference
        )
        .maybeSingle();

      if (existingError) {
        console.error(
          'Existing participant lookup error:',
          existingError
        );

        return res.status(500).json({
          success: false,
          message:
            'Unable to check existing registration.',
        });
      }

      /*
        If this payment has already been processed,
        return the existing participant.
      */

      if (existingParticipant) {
        return res.json({
          success: true,
          message:
            'Payment already processed.',
          participant:
            existingParticipant,
        });
      }

      /*
        6. Get registration details
           from Paystack metadata
      */

      const metadata =
        transaction.metadata;

      const fullName =
        metadata?.fullName;

      const level =
        metadata?.level;

      const areaOfInterest =
        metadata?.areaOfInterest;

      if (
        !fullName ||
        !level ||
        !areaOfInterest
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Registration information is missing from payment.',
        });
      }

      /*
        7. Create confirmed participant

        participant_id is NOT supplied here.

        Supabase automatically generates it
        using public.generate_participant_id().
      */

      const {
        data: participant,
        error: insertError,
      } = await supabase
        .from('participants')
        .insert({
          full_name:
            fullName,

          email:
            transaction.customer?.email,

          level,

          area_of_interest:
            areaOfInterest,

          payment_status:
            'Paid',

          paystack_reference:
            reference,

          attendance_status:
            'Not Attended',
        })
        .select()
        .single();

      if (insertError) {

        /*
          Another request may have processed
          this payment at almost the same time.
        */

        if (
          insertError.code === '23505'
        ) {
          const {
            data:
              existingParticipant,
          } = await supabase
            .from('participants')
            .select('*')
            .eq(
              'paystack_reference',
              reference
            )
            .single();

          if (existingParticipant) {
            return res.json({
              success: true,
              message:
                'Payment already processed.',
              participant:
                existingParticipant,
            });
          }
        }

        console.error(
          'Participant insert error:',
          insertError
        );

        return res.status(500).json({
          success: false,
          message:
            'Payment verified but participant could not be created.',
        });
      }

      /*
        8. Send confirmation email
      */

      const emailResult =
        await sendConfirmationEmail(
          participant
        );

      if (!emailResult.success) {
        console.error(
          'Confirmation email failed:',
          emailResult.error
        );

        /*
          Registration remains successful
          even if email delivery fails.
        */
      } else {
        console.log(
          'Confirmation email sent successfully to:',
          participant.email
        );
      }

      /*
        9. Return confirmed participant
      */

      return res.json({
        success: true,
        message:
          'Payment verified and registration confirmed.',
        participant,
      });

    } catch (error) {
      console.error(
        'Paystack verification error:',
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        message:
          'Unable to verify payment.',
      });
    }
  }
);

/* =========================
   SERVER
========================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});