import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase_url = "https://uaryunimyhiwgcakbtai.supabase.co"
const publishable_key = "sb_publishable_wwdx3Mtpl3k6NPail9hlAA_6vXAlI3i"

const supabase = createClient(supabase_url, publishable_key)
console.log("Supabase Initialized:", supabase);

// ==========================================
// 1. REGISTER FUNCTION
// ==========================================
async function register(event) {
    event.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var phone = document.getElementById("phone").value
    var password = document.getElementById("password").value
    var cpassword = document.getElementById("cpassword").value

    if (!name) {
        alert("Name is required")
        return;
    }

    if (password !== cpassword) {
        alert("Passwords should be identical")
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp(
            {
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: name,
                        Phone: phone,
                        password: password
                    }
                }
            }
        )

        if (error) {
            console.log(error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ab47bc'
            });
            return;
        }

        Swal.fire({
            title: 'Success!',
            text: (name + " Registered Successfully"),
            icon: 'success',
            background: '#1a1a2e',
            color: '#fff',
            confirmButtonColor: '#ab47bc'
        });

        // Timeout taake user success alert dekh sake
        setTimeout(() => {
            window.location.href = "dashboard.html"
        }, 2000);

    } catch (error) {
        console.log(error);
    }
}

// ==========================================
// 2. LOGIN FUNCTION
// ==========================================
async function login(event) {
    event.preventDefault()

    var loginEmail = document.getElementById("loginEmail").value
    var loginPass = document.getElementById("loginPass").value

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPass,
        })

        console.log(data);

        if (error) {
            console.log(error);
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ab47bc'
            });
        } else {
            Swal.fire({
                title: 'Success!',
                text: 'Login Successful',
                icon: 'success',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ab47bc'
            });
            setTimeout(() => {
                window.location.href = "dashboard.html"
            }, 2000);
        }
    } catch (error) {
        Swal.fire({
            title: 'Error!',
            text: 'Login failed',
            icon: 'error',
            background: '#1a1a2e',
            color: '#fff',
            confirmButtonColor: '#ab47bc'
        });
    }
}

const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session)

    if (event === 'INITIAL_SESSION') {

        if (!session) {
            Swal.fire({
                title: 'Error!',
                text: 'User not logged in',
                icon: 'error',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ab47bc'
            });
        }

    } else if (event === 'SIGNED_IN') {
        Swal.fire({
            title: 'Success!',
            text: 'User signed in successfully',
            icon: 'success',
            background: '#1a1a2e',
            color: '#fff',
            confirmButtonColor: '#ab47bc'
        });
        location.href = "dashboard.html";

    }
})

// call unsubscribe to remove the callback

async function signUpWithGoogle(){
  // Api And Services 
  // Create Project
  // Create Credentials
  //OAuth client ID
  //Configure Consent screen'
  //Get Started
  //Project setup kren
  //Create OAuth Cliet
  // Urls: Project url, local/ hosted url
  //redirect url:Project url/auth/v1/callback, local/ hosted url/auth/callback
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://127.0.0.1:5500/dashboard.html'
      }
    })
  } catch (error) {
    console.log(error);
  }
}


// ==========================================
// 4. BINDING & EVENT LISTENERS
// ==========================================

// Functions ko global window object par attach karna (Modules ke liye zaroori hai)
window.register = register
window.login = login
window.signUpWithGoogle = signUpWithGoogle


