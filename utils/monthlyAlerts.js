import dotenv from 'dotenv';
if(process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import { User } from "../models/User.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import handlebars from 'handlebars';
import cron from "node-cron";
import nodemailer from "nodemailer"

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});
//Here we are getting current date and month and based on that we are tracking the first and the last date of the month
const getCurrentMonthDate=()=>{
    const now=new Date();
    const startOfMonth=new Date(now.getFullYear(),now.getMonth(),1);
    const endOfMonth=new Date(now.getFullYear(),now.getMonth()+1,0);
    return {startOfMonth,endOfMonth};
}
//Get Accounts and Transaction from the user schema and keep adding the transactions
const fetchUserData=async(userId,startDate,endDate)=>{
    const user= await User.findById(userId).populate({
        path:"accounts",
        populate:{
            path:"transactions",
            match:{date:{$gte: startDate, $lte:endDate}},
            options: { sort: { date: 1 } }
        }
    });
    if(!user)
        {
            throw new Error("User not found");
        }
      //   user.accounts.forEach((account) => {
      //     console.log(`Account: ${account._id}, Transactions:`, account.transactions);
      //  });
        const initialBalance = user.accounts.reduce((total, account) => {
            return total + parseFloat(account.initialBalance.toString());
          }, 0);
        
          const currentBalance = user.accounts.reduce((total, account) => {
            return total + parseFloat(account.balance.toString());
          }, 0);
        
          const expensesByCategory = {};
          user.accounts.forEach((account) => {
              account.transactions.forEach((transaction) => {
                  if (transaction.type === 'Expense') {
                      if (!expensesByCategory[transaction.category]) {
                          expensesByCategory[transaction.category] = 0;
                      }
                      expensesByCategory[transaction.category] += parseFloat(transaction.amount.toString());
                  }
              });
          });
        
          return { initialBalance, currentBalance, expensesByCategory };    
        
}
//This method generates the insights for the user using the gemini model
const generateInsights = async (expensesByCategory,currentBalance) => {
  if (Object.keys(expensesByCategory).length === 0) {
    return "No expenses found for this month. Great job on managing your finances!";
  }

  // Calculate total expenses
  const totalExpenses = Object.values(expensesByCategory).reduce((total, amount) => total + amount, 0);

  // Customize the prompt based on the total expenses
  let prompt;
  if (currentBalance < 0) {
    prompt = `You have a negative balance of ₹${Math.abs(currentBalance).toFixed(2)} this month, with the following expenses:
    - Expenses by Category: ${JSON.stringify(expensesByCategory)}
    Provide constructive feedback on how to improve their financial health and avoid overspending. Highlight areas where they can cut back. 
    Important Instructions, start every instruction on a new line:
    1. Do not suggest using spreadsheets for expense tracking.
    2. Provide 3-4 actionable suggestions to address the issue.
    3. Keep the insights concise and well-formatted, not exceeding 10 lines.`;
  } else if (currentBalance < 100) {
    prompt = `You have a low balance of ₹${currentBalance.toFixed(2)} this month, with the following expenses:
    - Expenses by Category: ${JSON.stringify(expensesByCategory)}
    Provide suggestions on how to increase savings or reduce expenses to improve their financial health.
    Important Instructions, start every instruction on a new line:
    1. Do not suggest using spreadsheets for expense tracking.
    2. Provide 3-4 actionable suggestions to improve savings or reduce expenses.
    3. Keep the insights concise and well-formatted, not exceeding 10 lines.`;
  } else {
    prompt = `You have a healthy balance of ₹${currentBalance.toFixed(2)} this month, with the following expenses:
    - Expenses by Category: ${JSON.stringify(expensesByCategory)}
    Provide a summary of spending patterns and constructive suggestions for improvement. Highlight positive habits and areas for potential savings.
    Format the insights as follows and add every points to a new line:
    1. Start with a brief summary of the financial situation.
    2. Highlight positive spending habits.
    3. Provide 2-3 suggestions for further improvement.
    4. Keep the insights concise and well-formatted, not exceeding 10 lines.`;
  }
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating insights with Gemini:', error);
    return "Unable to generate insights at this time.";
  }
};
//This method first find the email template source and then it compiles it using handlebars
const compileTemplate=(templatePath,data)=>{
  const templateSource=fs.readFileSync(templatePath,'utf-8');
  const template=handlebars.compile(templateSource);
  return template(data);
}
//This method is used to send the email to the user
const sendEmail=async(to,subject,html)=>{
  const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS,
    }
  })

const mailOptions={
  from:process.env.EMAIL_USER,
  to,
  subject,
  html,
}
await transporter.sendMail(mailOptions)
}
//This method finally sends the alerts to the user after fetching all the info from the methods
const sendMonthlyAlerts=async()=>{
  try {
    const {startOfMonth,endOfMonth}=getCurrentMonthDate();
    const users= await User.find({});
    for(const user of users )
      {
        const {initialBalance,currentBalance,expensesByCategory}=await fetchUserData(user._id, startOfMonth,endOfMonth);
        const insights=await generateInsights(expensesByCategory, parseFloat(currentBalance.toString()));
        const cta = `
        <strong>Keep using FinanceFlow to:</strong>
        <ul>
          <li>Track your expenses effortlessly.</li>
          <li>Receive personalized insights to improve your financial health.</li>
          <li>Set and achieve your financial goals with ease.</li>
          <li>Stay on top of your finances with monthly reports like this one.</li>
        </ul>
        Thank you for trusting FinanceFlow to help you manage your money better!`;
        const emailHtml=compileTemplate('./templates/email-template.hbs',{
          initialBalance,
          currentBalance,
          expensesByCategory,
          insights,
          cta,
        })
        await sendEmail(user.email,"Monthly Expense Report",emailHtml);
      }
      console.log("Monthly alerts sent successfully");
  } catch (error) {
    console.error("Error sending alerts",error);
  }
};
export {sendMonthlyAlerts};

