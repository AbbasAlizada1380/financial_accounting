// backend/config/passport.js

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User'); // مطمئن شوید مسیر به مدل User درست است
require('dotenv').config();

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

// این بخش کلیدی است: ما یک تابع را export می‌کنیم که شیء passport را به عنوان ورودی می‌گیرد
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // jwt_payload شامل اطلاعاتی است که ما هنگام ساخت توکن در آن قرار دادیم (مثلاً id کاربر)
        const user = await User.findByPk(jwt_payload.id);

        if (user) {
          // اگر کاربر پیدا شد، آن را برگردان
          return done(null, user);
        }
        // اگر کاربر پیدا نشد
        return done(null, false);
      } catch (err) {
        console.error(err);
        return done(err, false);
      }
    })
  );
};