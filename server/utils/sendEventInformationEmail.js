import { BrevoClient } from '@getbrevo/brevo';

const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export async function sendEventInformationEmail(
  participant,
  eventDetails
) {
  try {
    const interest =
      participant.area_of_interest === 'None'
        ? 'Food, vibes & plot 😂'
        : participant.area_of_interest;

    const {
      date,
      time,
      venue,
      colourCode,
    } = eventDetails;

    const result =
      await brevoClient.transactionalEmails.sendTransacEmail({
        subject: 'PICNIC VELOURA — Event Information',

        htmlContent: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            color: #222;
          ">

            <div style="
              text-align: center;
              padding: 25px;
              background: #f8edef;
              border-radius: 16px;
            ">
              <p style="
                margin: 0 0 8px;
                font-size: 12px;
                letter-spacing: 2px;
                color: #8e3f57;
                font-weight: bold;
              ">
                PICNIC VELOURA
              </p>

              <h1 style="
                margin: 0;
                font-size: 28px;
              ">
                Event Information
              </h1>
            </div>

            <p style="
              font-size: 16px;
              line-height: 1.6;
              margin-top: 30px;
            ">
              Hello <strong>${participant.full_name}</strong>,
            </p>

            <p style="
              font-size: 15px;
              line-height: 1.7;
            ">
              We're excited to share the confirmed details
              for <strong>PICNIC VELOURA</strong>.
            </p>

            <div style="
              margin: 25px 0;
              padding: 20px;
              background: #faf7f3;
              border-radius: 14px;
            ">

              <p style="margin: 8px 0;">
                <strong>Date:</strong>
                ${date}
              </p>

              <p style="margin: 8px 0;">
                <strong>Time:</strong>
                ${time}
              </p>

              <p style="margin: 8px 0;">
                <strong>Venue:</strong>
                ${venue}
              </p>

              <p style="margin: 8px 0;">
                <strong>Colour Code:</strong>
                ${colourCode}
              </p>

            </div>

            <div style="
              margin: 25px 0;
              padding: 20px;
              background: #f8edef;
              border-radius: 14px;
            ">

              <p style="
                margin: 0 0 12px;
                color: #8e3f57;
                font-weight: bold;
              ">
                YOUR REGISTRATION
              </p>

              <p style="margin: 8px 0;">
                <strong>Event ID:</strong>
                ${participant.participant_id}
              </p>

              <p style="margin: 8px 0;">
                <strong>Name:</strong>
                ${participant.full_name}
              </p>

              <p style="margin: 8px 0;">
                <strong>Level:</strong>
                ${participant.level}
              </p>

              <p style="margin: 8px 0;">
                <strong>Area of Interest:</strong>
                ${interest}
              </p>

            </div>

            <div style="
              padding: 18px;
              border-left: 4px solid #8e3f57;
              background: #fff;
              margin-bottom: 25px;
            ">
              <p style="
                margin: 0;
                line-height: 1.6;
              ">
                Please keep your
                <strong>Event ID: ${participant.participant_id}</strong>
                safe. You will need it for event check-in.
              </p>
            </div>

            <p style="
              font-size: 15px;
              line-height: 1.7;
            ">
              We look forward to seeing you at Picnic Veloura —
              an experience of colour, creativity, music and connection.
            </p>

            <p style="
              margin-top: 30px;
              color: #666;
              font-size: 13px;
            ">
              Office of the Director of Socials
            </p>

          </div>
        `,

        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: participant.email,
            name: participant.full_name,
          },
        ],
      });

    console.log(
      'Event information email sent:',
      result
    );

    return {
      success: true,
      data: result,
    };

  } catch (error) {
    console.error(
      'Event information email error:',
      error.body || error.message
    );

    return {
      success: false,
      error: error.body || error.message,
    };
  }
}