    // এই Netlify Function ফাইলটি শুধুমাত্র পরীক্ষা করার জন্য যে ফাংশনটি ডিপ্লয় হচ্ছে কিনা।
    // এটি কোনো ইমেইল পাঠাবে না।

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
            // রিকোয়েস্ট বডি থেকে ডেটা পার্স করুন (যদিও এই ফাংশনটি ডেটা ব্যবহার করবে না)
            const data = JSON.parse(event.body);
            console.log('Received data:', data); // ডেটা কনসোলে লগ করুন

            // সফল হলে প্রতিক্রিয়া পাঠান
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Function deployed and received data successfully!' })
            };

        } catch (error) {
            console.error('Error in function:', error); // ত্রুটি কনসোলে লগ করুন
            // ত্রুটি হলে প্রতিক্রিয়া পাঠান
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Function encountered an error', error: error.message })
            };
        }
    };
    
