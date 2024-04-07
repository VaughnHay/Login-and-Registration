const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://llfhkqdenvzoutfuqglg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsZmhrcWRlbnZ6b3V0ZnVxZ2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIyMTExMjUsImV4cCI6MjAyNzc4NzEyNX0.cJBk8QaFjwAPUd6Q93Ipti5dG2U-p_flNQYHfDk_SAY'

const supabase = createClient(supabaseUrl, supabaseKey);

function initialize(passport, getUserByEmail, getUserById){
    // Function to authenticate users
    const authenticateUsers = async (email, password, done) => {
        // Get users by email from Supabase
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error(error);
            return done(error);
        }

        if (data.length === 0) {
            return done(null, false, { message: "No user found with that email" });
        }

        const user = data[0];
        
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            console.log(e);
            return done(e);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers));
    passport.serializeUser((user, done) => done(null, user.user_id)); // Assuming user_id is the unique identifier
    passport.deserializeUser(async (id, done) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', id);

        if (error) {
            console.error(error);
            return done(error);
        }

        if (data.length === 0) {
            return done(null, false);
        }

        const user = data[0];
        return done(null, user);
    });
}

module.exports = initialize;