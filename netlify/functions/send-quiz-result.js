// এই Netlify Function ফাইলটি কুইজ থেকে ডেটা গ্রহণ করবে এবং Gmail ব্যবহার করে ইমেইল পাঠাবে।

// Nodemailer লাইব্রেরি ইম্পোর্ট করুন।
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
            headers: { 'Allow': 'POST' }
        };
    }

    try {
        // রিকোয়েস্ট বডি থেকে ডেটা পার্স করুন
        const data = JSON.parse(event.body);
        // ডেটা থেকে প্রয়োজনীয় তথ্যগুলো নিন
        const { type, name, studentClass, roll, score, total, sessionId, timestamp } = data;

        let subject = '';
        let emailBody = '';

        // --- এখানে আপনার Gmail অ্যাড্রেস এবং App Password Netlify Environment Variable থেকে আসবে ---
        const senderEmail = process.env.GMAIL_USER; // এটি Netlify Environment Variable থেকে আসবে
        const senderAppPassword = process.env.GMAIL_APP_PASSWORD; // এটি Netlify Environment Variable থেকে আসবে

        // --- এখানে আপনার অ্যাডমিন ইমেইল অ্যাড্রেস বসানো হয়েছে ---
        const adminEmail = 'optimussentry01@gmail.com'; // <--- আপনার অ্যাডমিন Gmail আইডি এখানে বসানো হয়েছে

        // নিশ্চিত করুন যে প্রয়োজনীয় ভেরিয়েবলগুলো সেট করা আছে
        if (!senderEmail || !senderAppPassword) {
            console.error('Environment variables GMAIL_USER or GMAIL_APP_PASSWORD are not set.');
            return {
                statusCode: 500,
                body: 'Sender email or app password not configured in Netlify Environment Variables.'
            };
        }

        // Nodemailer ট্রান্সপোর্টার তৈরি করুন (Gmail এর জন্য)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: senderEmail,
                pass: senderAppPassword,
            },
        });

        // কুইজের ধরণ অনুযায়ী ইমেইলের বিষয়বস্তু তৈরি করুন
        if (type === 'started') {
            subject = `কুইজ শুরু হয়েছে: ${name} (${studentClass}, রোল: ${roll})`;
            emailBody = `
                <p>প্রিয় অ্যাডমিন,</p>
                <p>একজন শিক্ষার্থী ওয়েব ডেভেলপমেন্ট কুইজ শুরু করেছে:</p>
                <ul>
                    <li><strong>নাম:</strong> ${name}</li>
                    <li><strong>শ্রেণি:</strong> ${studentClass}</li>
                    <li><strong>রোল:</strong> ${roll}</li>
                    <li><strong>সেশন আইডি:</strong> ${sessionId}</li>
                    <li><strong>সময়:</strong> ${new Date(timestamp).toLocaleString('bn-BD')}</li>
                </ul>
                <p>এই সেশনটি ট্র্যাক করুন।</p>
                <p>ধন্যবাদ,<br>আপনার কুইজ সিস্টেম</p>
            `;
        } else if (type === 'completed') {
            subject = `কুইজ সম্পন্ন হয়েছে: ${name} (${studentClass}, রোল: ${roll}) - স্কোর: ${score}/${total}`;
            emailBody = `
                <p>প্রিয় অ্যাডমিন,</p>
                <p>একজন শিক্ষার্থী ওয়েব ডেভেলপমেন্ট কুইজ সফলভাবে সম্পন্ন করেছে:</p>
                <ul>
                    <li><strong>নাম:</strong> ${name}</li>
                    <li><strong>শ্রেণি:</strong> ${studentClass}</li>
                    <li><strong>রোল:</strong> ${roll}</li>
                    <li><strong>স্কোর:</strong> ${score} / ${total}</li>
                    <li><strong>সেশন আইডি:</strong> ${sessionId}</li>
                    <li><strong>সময়:</strong> ${new Date(timestamp).toLocaleString('bn-BD')}</li>
                </ul>
                <p>শিক্ষার্থীর পারফরম্যান্স পর্যালোচনা করুন।</p>
                <p>ধন্যবাদ,<br>আপনার কুইজ সিস্টেম</p>
            `;
        } else if (type === 'abandoned') {
            subject = `কুইজ পরিত্যক্ত হয়েছে: ${name} (${studentClass}, রোল: ${roll}) - বর্তমান স্কোর: ${score}/${total}`;
            emailBody = `
                <p>প্রিয় অ্যাডমিন,</p>
                <p>একজন শিক্ষার্থী ওয়েব ডেভেলপমেন্ট কুইজ মাঝপথে ছেড়ে দিয়েছে:</p>
                <ul>
                    <li><strong>নাম:</strong> ${name}</li>
                    <li><strong>শ্রেণি:</strong> ${studentClass}</li>
                    <li><strong>রোল:</strong> ${roll}</li>
                    <li><strong>ছেড়ে দেওয়ার সময় স্কোর:</strong> ${score} / ${total}</li>
                    <li><strong>সেশন আইডি:</strong> ${sessionId}</li>
                    <li><strong>সময়:</strong> ${new Date(timestamp).toLocaleString('bn-BD')}</li>
                </ul>
                <p>শিক্ষার্থীকে কুইজ সম্পন্ন করার জন্য উৎসাহিত করা যেতে পারে।</p>
                    <p>ধন্যবাদ,<br>আপনার কুইজ সিস্টেম</p>
            `;
        } else {
            console.warn('Received invalid email type:', type);
            return {
                statusCode: 400,
                body: 'Invalid email type provided.'
            };
        }

        // ইমেইল পাঠানোর অপশন সেট করুন
        const mailOptions = {
            from: senderEmail, // যে Gmail আইডি থেকে ইমেইল যাবে (Netlify Environment Variable থেকে)
            to: adminEmail,    // যে Gmail আইডিতে ইমেইল যাবে (optimussentry01@gmail.com)
            subject: subject,
            html: emailBody,
        };

        // ইমেইল পাঠান
        await transporter.sendMail(mailOptions);

        // সফল হলে প্রতিক্রিয়া পাঠান
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully!' })
        };

    } catch (error) {
        console.error('Error sending email:', error); // ত্রুটি কনসোলে দেখাবে
        // ত্রুটি হলে প্রতিক্রিয়া পাঠান
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send email', error: error.message })
        };
    }
};
