# 🌟 Catch the Star Game

An interactive web-based game built with Node.js and Express, featuring user authentication and real-time gameplay.

## 📋 Features

- User authentication and session management
- Interactive gameplay mechanics
- MongoDB database integration
- Responsive web design
- Secure user data handling

## 🚀 Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - EJS (Embedded JavaScript templates)

- **Authentication & Security:**
  - bcrypt for password hashing
  - JWT (JSON Web Tokens)
  - Express-session for session management
  - Cookie-parser

- **Development Tools:**
  - Nodemon for development
  - Dotenv for environment variables

## 🛠️ Prerequisites

Before running this project, make sure you have the following installed:
- Node.js (v12 or higher)
- MongoDB
- npm or yarn package manager

## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd catch-the-star-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`

## 🎮 How to Play

1. Create an account or log in
2. Navigate to the game interface
3. Follow the on-screen instructions to catch stars and earn points
4. Track your progress on the leaderboard

## 📁 Project Structure

```
catch-the-star-game/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── public/         # Static files
├── routes/         # Application routes
├── views/          # EJS templates
├── server.js       # Main application file
└── package.json    # Project dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- [Your Name] - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped with the project
- Special thanks to the Node.js and Express.js communities
