// Notification Types
export const NOTIFICATION_TYPES = {
  PROFILE_UPDATE_REMINDER: "PROFILE_UPDATE_REMINDER",
  DASHBOARD_FEEDBACK: "DASHBOARD_FEEDBACK",
  GENERAL_ANNOUNCEMENT: "GENERAL_ANNOUNCEMENT",
  LEAVE_STATUS: "LEAVE_STATUS",
  ACADEMIC_UPDATE: "ACADEMIC_UPDATE",
  ONBOARDING_WELCOME: "ONBOARDING_WELCOME",
};

// Email Templates
export const EMAIL_TEMPLATES = {
  [NOTIFICATION_TYPES.PROFILE_UPDATE_REMINDER]: {
    subject: "Complete Your Professional Profile",
    template: (studentName) => ({
      subject:
        "Action Required: Complete Your Professional Profile on VCET Connect",
      text: `Dear ${studentName},

We hope you're having a great academic journey at VCET! We noticed your professional profile on VCET Connect needs some important updates. A complete profile is crucial for your academic progress and future career opportunities.

Required Profile Updates:
- LinkedIn Profile - Connect with professionals and showcase your experience
- GitHub Account - Display your coding projects and contributions  
- LeetCode/HackerRank - Demonstrate your problem-solving skills
- Portfolio Website - Highlight your achievements and projects
- Updated Resume - Keep your professional document current

Having these profiles will help you:
- Track your skill development
- Showcase your academic projects

Please log in to VCET Connect and complete your profile. Use your Register Number as the password. If you need to reset your password, use the "Forgot Password" option on the login page.

Need help? Contact our support team at navinkumaranoh@gmail.com (Temporary Mail In Development)

Best regards,
VCET COONNECT Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a56db; margin-bottom: 20px;">Complete Your Professional Profile on VCET Connect</h2>
        
        <p style="color: #374151; line-height: 1.5;">Dear ${studentName},</p>
        
        <p style="color: #374151; line-height: 1.5;">We hope you're having a great academic journey at VCET! We noticed your professional profile on VCET Connect needs some important updates.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">Why Complete Your Profile?</h3>
          <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
            <li>Better tracking of your skill development</li>
            <li>Showcase your academic achievements</li>
          </ul>
        </div>

        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">Required Profile Updates:</h3>
          <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">📊 LinkedIn Profile</li>
            <li style="margin-bottom: 8px;">💻 GitHub Account</li>
            <li style="margin-bottom: 8px;">🏆 LeetCode/HackerRank Profiles</li>
            <li style="margin-bottom: 8px;">🌐 Portfolio Website</li>
            <li style="margin-bottom: 8px;">📄 Updated Resume</li>
          </ul>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">How to Update:</h3>
          <ol style="color: #4b5563; margin: 0; padding-left: 20px;">
            <li>Log in to <a href="https://vcet-connect.onrender.com/" style="color: #2563eb;">VCET Connect</a></li>
            <li>Navigate to your Profile section</li>
            <li>Fill in all required fields</li>
            <li>Save your changes</li>
          </ol>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; color: #4b5563;">Need help? Contact our support team:<br>
          <a href="mailto:navinkumaranoh@gmail.com" style="color: #2563eb;">navinkumaranoh@gmail.com (Temporary Mail In Development)</a></p>
        </div>

        <div style="margin-top: 20px; color: #4b5563;">
          <p style="margin: 0;">Best regards,<br>VCET CONNECT Team</p>
        </div>
      </div>`,
    }),
  },
  [NOTIFICATION_TYPES.DASHBOARD_FEEDBACK]: {
    subject: "Share Your Feedback on VCET Connect Dashboard",
    template: (studentName) => ({
      subject: "Your Feedback Matters: VCET Connect Dashboard",
      text: `Dear ${studentName},

We value your input! As you've been using the VCET Connect dashboard, we'd love to hear your thoughts on how we can improve it.

Please take a moment to:
1. Review the dashboard features
2. Share your suggestions for improvement
3. Report any issues you've encountered

Your feedback helps us make VCET Connect better for everyone.

Best regards,
VCET Connect Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Your Feedback Matters: VCET Connect Dashboard</h2>
        <p>Dear ${studentName},</p>
        <p>We value your input! As you've been using the VCET Connect dashboard, we'd love to hear your thoughts on how we can improve it.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Please take a moment to:</p>
          <ol style="margin-top: 10px;">
            <li>Review the dashboard features</li>
            <li>Share your suggestions for improvement</li>
            <li>Report any issues you've encountered</li>
          </ol>
        </div>
        <p>Your feedback helps us make VCET Connect better for everyone.</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0; color: #4b5563;">Best regards,<br>VCET Connect Team</p>
        </div>
      </div>`,
    }),
  },
  [NOTIFICATION_TYPES.ONBOARDING_WELCOME]: {
    subject: "Welcome to VCET Connect - Your Academic Journey Begins Here!",
    template: (studentName) => ({
      subject: "Welcome to VCET Connect - Your Academic Journey Begins Here!",
      text: `Dear ${studentName},

Welcome to VCET Connect! We're excited to have you join our platform designed to enhance your academic journey at Velammal College of Engineering and Technology.

Here's what you can do on VCET Connect:

1. Academic Dashboard
   - View your semester results and CGPA
   - Track your academic progress
   - Access course materials

2. Professional Profile
   - Create your professional portfolio
   - Link your coding profiles (LeetCode, GitHub, HackerRank)
   - Showcase your projects and achievements

3. Leave Management
   - Submit leave applications online
   - Track application status
   - View attendance records

4. Communication
   - Direct communication with mentors
   - Department announcements
   - Important updates

Getting Started:
1. Complete your profile setup
2. Add your professional links
3. Explore the dashboard features
4. Connect with your mentor

Need Help?
If you have any questions or need assistance, please reach out to your class advisor or mentor.

Best regards,
VCET Connect Team`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(to right, #1a56db, #3b82f6); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to VCET Connect!</h1>
          <p style="color: #e5e7eb; margin-top: 10px;">Your Academic Journey Begins Here</p>
        </div>
        
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="color: #374151;">Dear ${studentName},</p>
          
          <p style="color: #374151;">We're excited to have you join our platform designed to enhance your academic journey at Velammal College of Engineering and Technology.</p>
          
          <div style="margin: 25px 0;">
            <h2 style="color: #1a56db; font-size: 18px; margin-bottom: 15px;">Here's what you can do on VCET Connect:</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📊 Academic Dashboard</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>View your semester results and CGPA</li>
                <li>Track your academic progress</li>
                <li>Access course materials</li>
              </ul>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">👨‍💻 Professional Profile</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>Create your professional portfolio</li>
                <li>Link your coding profiles (LeetCode, GitHub, HackerRank)</li>
                <li>Showcase your projects and achievements</li>
              </ul>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">📅 Leave Management</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>Submit leave applications online</li>
                <li>Track application status</li>
                <li>View attendance records</li>
              </ul>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">💬 Communication</h3>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li>Direct communication with mentors</li>
                <li>Department announcements</li>
                <li>Important updates</li>
              </ul>
            </div>
          </div>
          
          <div style="margin: 25px 0; padding: 20px; background: #dbeafe; border-radius: 8px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">🚀 Getting Started:</h3>
            <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
              <li>Complete your profile setup</li>
              <li>Add your professional links</li>
              <li>Explore the dashboard features</li>
              <li>Connect with your mentor</li>
            </ol>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 25px;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Need Help?</h3>
            <p style="margin: 0; color: #4b5563;">If you have any questions or need assistance, please reach out to your class advisor or mentor.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280;">Best regards,<br>VCET Connect Team</p>
          </div>
        </div>
      </div>`,
    }),
  },
};

// General purpose template generator for custom notifications
export const generateCustomTemplate = (type, title, message, studentName) => ({
  subject: title,
  text: `Dear ${studentName},\n\n${message}\n\nBest regards,\nVCET Connect Team`,
  html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1a56db;">${title}</h2>
    <p>Dear ${studentName},</p>
    <p>${message}</p>
    <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
      <p style="margin: 0; color: #4b5563;">Best regards,<br>VCET Connect Team</p>
    </div>
  </div>`,
});
