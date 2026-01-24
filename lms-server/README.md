# 🎓 LMS Backend (Node.js)

The backend API server for the Learning Management System built with Node.js, Express, and MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-5.1.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8.16.4-green)
![JWT](https://img.shields.io/badge/JWT-9.0.2-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [File Upload](#-file-upload)
- [Email System](#-email-system)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based sessions
- **Role-Based Access Control**: Student, Teacher, Admin permissions
- **Password Security**: bcrypt hashing with salt rounds
- **Password Reset**: Email-based OTP verification
- **Session Management**: Automatic token expiration

### 📚 Course Management
- **Course CRUD**: Create, read, update, delete courses
- **Teacher Assignment**: Assign teachers to courses
- **Student Enrollment**: Enroll students in courses
- **Resource Management**: File and link uploads
- **Course Comments**: Interactive feedback system

### ⏰ Timetable System
- **Schedule Creation**: Flexible timetable setup
- **Time Slot Management**: Multiple time slots per day
- **Conflict Detection**: Automated schedule validation
- **Bulk Assignment**: Mass timetable operations
- **Day-wise Organization**: Weekday-based structure

### 🧪 Assessment System
- **Test Creation**: MCQ and theory-based tests
- **Question Management**: Multiple question types
- **Auto-Grading**: Instant MCQ result calculation
- **Manual Grading**: Teacher grading for theory questions
- **Result Analytics**: Performance tracking and reports
- **Expiry Management**: Time-limited test access

### 💬 Communication
- **Messenger System**: Teacher-student communication
- **Message Broadcasting**: Send messages to multiple recipients
- **Notification System**: Real-time updates
- **Email Integration**: Automated email notifications

### 👥 User Management
- **Multi-Role Users**: Student, Teacher, Admin accounts
- **Profile Management**: Complete user profile CRUD
- **Registration System**: Student self-registration
- **Admin Creation**: Secure teacher account creation
- **Welcome Emails**: Automated account notifications

### 📁 File Management
- **File Upload**: Secure file storage system
- **Type Validation**: Restricted file types
- **Size Limits**: Configurable file size restrictions
- **Access Control**: Role-based file access
- **Static Serving**: Efficient file delivery

## 🛠 Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js 5.1.0** - Web application framework
- **MongoDB 8.16.4** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JWT 9.0.2** - JSON Web Tokens
- **bcryptjs 3.0.2** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing

### File Handling
- **Multer 2.0.2** - File upload middleware
- **Path** - File path utilities
- **FS** - File system operations

### Communication
- **Nodemailer 7.0.5** - Email functionality
- **SMTP** - Email transport

### Development Tools
- **Nodemon** - Development server with auto-restart
- **ESLint** - Code linting
- **Prettier** - Code formatting

## ⚡ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation
```bash
git clone https://github.com/yourusername/lms-project.git
cd lms-project/lms-server
npm install
cp .env.example .env
nano .env
```

### Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
BCRYPT_ROUNDS=10
```

### Database Setup
```bash
mongod
npm run setup-db
npm run setup-admin
```

### Development Server
```bash
npm run dev
```

### Production Server
```bash
npm start
npm install -g pm2
pm2 start index.js --name "lms-backend"
```

## 📁 Project Structure

```
lms-server/
├── controllers/               # Business logic
│   ├── adminController.js     # Admin operations
│   ├── studentController.js   # Student operations
│   ├── teacherController.js   # Teacher operations
│   └── testController.js      # Test management
├── models/                    # Database schemas
│   ├── User.js               # User model
│   ├── Course.js             # Course model
│   ├── Timetable.js          # Timetable model
│   ├── Test.js               # Test model
│   ├── Submission.js         # Test submission model
│   ├── Message.js            # Message model
│   ├── Note.js               # Note model
│   └── Reminder.js           # Reminder model
├── routes/                    # API endpoints
│   ├── auth.js               # Authentication routes
│   ├── student.js            # Student routes
│   ├── teacher.js            # Teacher routes
│   └── admin.js              # Admin routes
├── middleware/                # Custom middleware
│   ├── auth.js               # JWT authentication
│   ├── upload.js             # File upload middleware
│   └── validation.js         # Input validation
├── utils/                     # Helper functions
│   ├── email.js              # Email utilities
│   ├── password.js           # Password utilities
│   ├── validation.js         # Validation helpers
│   └── response.js           # Response formatting
├── uploads/                   # File storage
│   ├── resources/            # Course resources
│   ├── profiles/             # Profile pictures
│   └── temp/                 # Temporary files
├── config/                    # Configuration files
│   ├── database.js           # Database configuration
│   ├── email.js              # Email configuration
│   └── multer.js             # File upload configuration
├── index.js                   # Server entry point
├── setup-admin.js             # Admin user creation
├── package.json               # Dependencies and scripts
└── .env                       # Environment variables
```

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Register (Student)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /api/student/forgot-password
POST /api/teacher/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/student/reset-password
POST /api/teacher/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Student Endpoints

#### Dashboard
```http
GET /api/student/dashboard
Authorization: Bearer <token>
```

#### Profile
```http
GET /api/student/profile
Authorization: Bearer <token>
```

#### Courses
```http
GET /api/student/courses
Authorization: Bearer <token>
```

#### Timetable
```http
GET /api/student/timetable
Authorization: Bearer <token>
```

#### Tests
```http
GET /api/teacher/student-tests
Authorization: Bearer <token>
```

#### Submit Test
```http
POST /api/teacher/submit-test
Authorization: Bearer <token>
Content-Type: application/json

{
  "testId": "test_id",
  "answers": [
    {
      "questionId": "question_id",
      "answer": "student_answer"
    }
  ]
}
```

### Teacher Endpoints

#### Dashboard
```http
GET /api/teacher/dashboard
Authorization: Bearer <token>
```

#### Courses
```http
GET /api/teacher/courses
Authorization: Bearer <token>
```

#### Upload Resource
```http
POST /api/teacher/upload-resource
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "courseId": "course_id",
  "file": <file>
}
```

#### Add Comment
```http
POST /api/teacher/add-comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_id",
  "text": "Comment text"
}
```

#### Messenger
```http
GET /api/teacher/messenger
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/teacher/messenger
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Message content",
  "recipients": ["student_id1", "student_id2"]
}
```

### Admin Endpoints

#### Create Teacher
```http
POST /api/admin/create-teacher
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Teacher Name",
  "email": "teacher@example.com",
  "password": "password123"
}
```

#### List Users
```http
GET /api/admin/teachers
GET /api/admin/students
Authorization: Bearer <token>
```

#### Assign Course
```http
POST /api/admin/assign-course
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_id",
  "teacherId": "teacher_id",
  "studentIds": ["student_id1", "student_id2"]
}
```

#### Assign Timetable
```http
POST /api/admin/assign-timetable
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_id",
  "schedule": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "notes": "Optional notes"
    }
  ]
}
```

## 🗄 Database Schema

### User Model
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Course Model
```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  resources: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable'
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Test Model
```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['mcq', 'theory'],
      required: true
    },
    options: [String],
    correctAnswer: String,
    marks: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  published: {
    type: Boolean,
    default: false
  },
  expiryDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

## 🔐 Authentication

### JWT Implementation
```javascript
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

### Middleware
```javascript
const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied' });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied for this role' 
      });
    }
    next();
  };
};
```

### Password Security
```javascript
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

## 📁 File Upload

### Multer Configuration
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/webm'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
  },
  fileFilter: fileFilter
});
```

### Upload Endpoints
```javascript
router.post('/upload-resource', 
  authenticateJWT, 
  authorizeRoles('teacher', 'admin'),
  upload.single('file'),
  uploadResource
);

router.post('/upload-multiple',
  authenticateJWT,
  authorizeRoles('teacher', 'admin'),
  upload.array('files', 5),
  uploadMultipleResources
);
```

## 📧 Email System

### Email Configuration
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Email Templates
```javascript
const welcomeEmailTemplate = (name, email, password, registrationNumber) => `
  Dear ${name},
  
  Welcome to the Learning Management System!
  
  Your account has been successfully created with the following details:
  
  Name: ${name}
  Email: ${email}
  Registration Number: ${registrationNumber}
  Password: ${password}
  
  You can now log in to your account using your email or registration number.
  For security, please change your password after your first login.
  
  Best regards,
  LMS Administration Team
`;

const passwordResetTemplate = (otp) => `
  Your password reset OTP is: ${otp}
  
  This OTP will expire in 10 minutes.
  If you didn't request this, please ignore this email.
`;
```

### Email Functions
```javascript
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user, password) => {
  const subject = 'Welcome to LMS - Account Created';
  const html = welcomeEmailTemplate(
    user.name,
    user.email,
    password,
    user.registrationNumber
  );
  
  await sendEmail(user.email, subject, html);
};
```

## 🔒 Security

### Security Measures
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Mongoose ORM protection
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based validation
- **Rate Limiting**: Request throttling
- **CORS Configuration**: Cross-origin protection

### Security Middleware
```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Error Handling
```javascript
app.use((error, req, res, next) => {
  console.error(error.stack);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    message: 'Internal Server Error'
  });
});
```

## 🧪 Testing

### Test Setup
```bash
npm install --save-dev jest supertest
npm test
npm run test:coverage
npm run test:watch
```

### Test Examples
```javascript
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});

describe('GET /api/student/courses', () => {
  it('should return enrolled courses', async () => {
    const response = await request(app)
      .get('/api/student/courses')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.courses)).toBe(true);
  });
});
```

## 🚀 Deployment

### Production Setup
```bash
npm install -g pm2
pm2 start index.js --name "lms-backend"
pm2 save
pm2 startup
pm2 monit
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://your-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/uploads
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/lms
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads
  
  mongo:
    image: mongo:8.16.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Cloud Deployment

#### Heroku
```bash
heroku create your-lms-backend
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

#### AWS
```bash
ssh -i your-key.pem ubuntu@your-ec2-instance
git clone https://github.com/yourusername/lms-project.git
cd lms-server
npm install
pm2 start index.js --name "lms-backend"
```

## 📊 Monitoring

### Health Check
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});
```

### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Set up environment variables
5. Start development server: `npm run dev`
6. Make your changes
7. Run tests: `npm test`
8. Submit a pull request

### Code Style
- Use ESLint and Prettier
- Follow Node.js best practices
- Write meaningful commit messages
- Add comments for complex logic
- Include error handling

### API Documentation
- Update API documentation for new endpoints
- Include request/response examples
- Document error codes and messages
- Add authentication requirements

## 📈 Performance

### Optimization Techniques
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip compression for responses
- **File Streaming**: Efficient file uploads/downloads

### Performance Monitoring
```javascript
const responseTime = require('response-time');

app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time}ms`);
}));
```

## 🔧 Maintenance

### Database Maintenance
```javascript
const cleanupExpiredOTPs = async () => {
  await User.updateMany(
    { otpExpires: { $lt: new Date() } },
    { $unset: { otp: 1, otpExpires: 1 } }
  );
};

setInterval(cleanupExpiredOTPs, 24 * 60 * 60 * 1000);
```

### File Cleanup
```javascript
const fs = require('fs');
const path = require('path');

const cleanupTempFiles = async () => {
  const tempDir = path.join(__dirname, 'uploads', 'temp');
  const files = fs.readdirSync(tempDir);
  
  files.forEach(file => {
    const filePath = path.join(tempDir, file);
    const stats = fs.statSync(filePath);
    
    if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
      fs.unlinkSync(filePath);
    }
  });
};
```

## 📚 Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [PM2](https://pm2.keymetrics.io/) - Process manager

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using Node.js and Express**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/lms-project?style=social)](https://github.com/yourusername/lms-project/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/lms-project)](https://github.com/yourusername/lms-project/issues)

</div> 