
'use server';
/**
 * @fileOverview A utility to send One-Time Passwords (OTPs).
 *
 * - sendOtp - A function that handles sending an OTP to a mobile number or email.
 * - SendOtpInput - The input type for the sendOtp function.
 * - SendOtpOutput - The return type for the sendOtp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SendOtpInputSchema = z.object({
  target: z.enum(['mobile', 'email']).describe('The channel to send the OTP through.'),
  destination: z.string().describe('The mobile number or email address to send the OTP to.'),
  otp: z.string().length(6).describe('The 6-digit one-time password.'),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

// The output can be simple, just confirming success.
const SendOtpOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

/**
 * Sends an OTP to the specified destination.
 * In a real application, this would integrate with an SMS/Email service like Twilio or SendGrid.
 * For now, it simulates the action and logs it to the console.
 * @param input The details for sending the OTP.
 * @returns A promise that resolves with the success status.
 */
export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async ({ target, destination, otp }) => {
    
    //
    // --- Integration Point for Real Services ---
    // In a real-world scenario, you would add your email/SMS sending logic here.
    // For example, using a service like Twilio for SMS or SendGrid for email.
    //
    // Example (conceptual):
    // if (target === 'mobile') {
    //   await twilio.messages.create({
    //     body: `Your OTP for EduAssist is: ${otp}`,
    //     from: '+1234567890', // Your Twilio number
    //     to: destination,
    //   });
    // } else if (target === 'email') {
    //   await sendgrid.send({
    //     to: destination,
    //     from: 'no-reply@eduassist.com',
    //     subject: 'Your EduAssist OTP',
    //     text: `Your one-time password is: ${otp}`,
    //   });
    // }
    //
    
    // For this demo, we will just log the action to the server console.
    console.log(`[OTP Simulation] Sending OTP to ${target} (${destination}): ${otp}`);

    // We assume the operation is successful for the simulation.
    return {
      success: true,
      message: `OTP successfully sent to ${destination} via ${target}.`,
    };
  }
);
