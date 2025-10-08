const passport = require('passport');

exports.protect = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized: No token or invalid token' });
        }

        // Check trial period
        if (user.trialEndsAt && user.trialEndsAt < new Date() && user.role !== 'admin') {
            if (user.accountStatus === 'active') {
                user.accountStatus = 'pending_activation';
                await user.save();
            }
            return res.status(403).json({ 
                message: 'Your trial period has expired. Please contact an administrator to activate your account.' 
            });
        }
        
        // Check account status
        if (user.accountStatus !== 'active') {
            return res.status(403).json({ message: `Your account is currently ${user.accountStatus}. Access denied.` });
        }

        req.user = user;
        next();
    })(req, res, next);
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};