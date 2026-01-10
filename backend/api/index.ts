import app from '../src/app';

// This allows the app to be run locally
if (require.main === module) {
    const port = process.env.PORT || 3333;
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

// Export for Vercel Serverless Function
export default app;
