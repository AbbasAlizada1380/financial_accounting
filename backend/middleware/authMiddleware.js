const passport = require('passport');

// میدل‌ویر اصلی برای محافظت از روت‌ها
exports.protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized: No token or invalid token' });
        }

        // بررسی انقضای دوره آزمایشی
        if (user.trialEndsAt && user.trialEndsAt < new Date() && user.role !== 'admin') {
            if (user.accountStatus === 'active') {
                user.accountStatus = 'pending_activation';
                await user.save();
            }
            return res.status(403).json({ 
                message: 'Your trial period has expired. Please contact an administrator to activate your account.' 
            });
        }
        
        // بررسی وضعیت کلی اکانت
        if (user.accountStatus !== 'active') {
            return res.status(403).json({ message: `Your account is currently ${user.accountStatus}. Access denied.` });
        }

        req.user = user; // کاربر تأیید شده را به آبجکت request اضافه می‌کند
        next();
    })(req, res, next);
};

// میدل‌ویر برای دسترسی فقط ادمین
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};