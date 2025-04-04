import { transporter } from "./Email.config.js";
import { Verification_Email_Template, Welcome_Email_Template } from "./EmailTemplate.js";


export const sendOtp = async (email, otp) => {
    try {
        const response = await transporter.sendMail({
            from: `"Finance Flow" <${process.env.EMAIL_USER}>`, // sender address
            to: email, // list of receivers
            subject: "Verify your Email", // Subject line
            text: "Verify your Email", // plain text body
            html: Verification_Email_Template.replace("{otp}",otp), // html body
        });
        console.log("Email sent successfully",response);
        
    } catch (error) {
        console.log("Email error",error);
    }
}

export const WelcomeEmail = async (email, name  ) => {
    try {
        const response = await transporter.sendMail({
            from: `"Finance Flow" <${process.env.EMAIL_USER}>`, // sender address
            to: email, // list of receivers
            subject: "Welcome to FinanceFlow", // Subject line
            text: "Welcome to FinanceFlow", // plain text body
            html: Welcome_Email_Template.replace("{name}",name), // html body
        });
        console.log("Email sent successfully",response);
        
    } catch (error) {
        console.log("Email error",error);
    }
}