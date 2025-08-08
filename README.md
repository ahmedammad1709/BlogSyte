# BlogHive - Full-Stack Blog Platform

A modern blog platform built with React, Vite, and Vercel serverless functions.

## 🚀 Features

- **User Authentication** - OTP-based email verification
- **Blog Management** - Create, read, update, delete blog posts
- **Social Features** - Like, comment, and view tracking
- **Admin Panel** - User management and analytics
- **Responsive Design** - Modern UI with Tailwind CSS
- **Serverless Backend** - Deployed on Vercel

## 📁 Project Structure

```
BlogHive/
├── api/                    # Vercel serverless API
│   ├── auth.js            # Authentication endpoints
│   ├── blogs.js           # Blog posts CRUD & interactions
│   ├── contact.js         # Contact form handling
│   ├── admin/
│   │   └── index.js       # Admin dashboard endpoints
│   ├── user/
│   │   └── dashboard/
│   │       └── [userId].js # User dashboard endpoints
│   └── lib/
│       ├── db.js          # Database connection & utilities
│       ├── email.js       # Email service
│       └── otpStorage.js  # OTP temporary storage
├── src/                   # React frontend
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── context/          # React context providers
│   └── lib/              # Frontend utilities
└── public/               # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Vercel Functions** - Serverless API
- **PostgreSQL** - Database
- **Nodemailer** - Email service
- **bcryptjs** - Password hashing

## 🚀 Quick Deploy

### 1. Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres recommended)
- Gmail account with App Password

### 2. Environment Variables
Set these in your Vercel project:
```
DATABASE_URL=your_postgres_connection_string
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password
```

### 3. Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## 📊 API Endpoints

### Authentication
- `POST /api/send-otp` - Send OTP for registration
- `POST /api/verify-otp` - Verify OTP and create account
- `POST /api/login` - User login

### Blog Posts
- `GET /api/blogs` - Get all blog posts
- `POST /api/blogs` - Create new blog post
- `POST /api/blogs/[id]/like` - Like/unlike blog post
- `POST /api/blogs/[id]/comment` - Add comment
- `GET /api/blogs/[id]/comments` - Get comments
- `GET /api/blogs/[id]/like-status` - Check like status
- `POST /api/blogs/[id]/view` - Record view
- `GET /api/blogs/[id]/stats` - Get blog stats

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users` - Ban/unban users
- `GET /api/admin/blogs` - Get all blogs
- `DELETE /api/admin/blogs` - Delete blog

### User
- `GET /api/user/dashboard/[userId]` - Get user dashboard

## 🗄️ Database Schema

The application automatically creates these tables:
- `users` - User accounts
- `blog_posts` - Blog posts
- `likes` - User likes
- `comments` - User comments
- `views` - Blog views
- `notifications` - System notifications
- `user_notifications` - User notification links
- `otp_storage` - OTP temporary storage
- `pending_users` - Pending user registrations

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add GMAIL_USER
vercel env add GMAIL_PASS
```

## 🔒 Security Features

- **OTP Authentication** - Secure email verification
- **Password Hashing** - bcrypt with salt rounds
- **CORS Protection** - Configured per endpoint
- **Input Validation** - Server-side validation
- **SQL Injection Protection** - Parameterized queries

## 📈 Performance

- **Serverless Functions** - Auto-scaling
- **Database Connection Pooling** - Efficient connections
- **CDN** - Global content delivery
- **Edge Functions** - Low latency

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` environment variable
   - Ensure database is accessible from Vercel
   - Verify SSL settings

2. **Email Not Sending**
   - Check Gmail credentials
   - Verify App Password is correct
   - Check Vercel function logs

3. **CORS Errors**
   - Each function handles CORS individually
   - Check if frontend URL is allowed

### Debug Commands
```bash
# View function logs
vercel logs

# Test locally
vercel dev

# Check environment variables
vercel env ls
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Documentation**: Check the code comments
- **Issues**: Create GitHub issues
- **Vercel Docs**: https://vercel.com/docs
"// trigger redeploy" 
