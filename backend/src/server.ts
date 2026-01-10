import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log('\n🚀 Yurucamp Backend Server');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}`);
    console.log('\n⏳ Checking connections...\n');
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});
