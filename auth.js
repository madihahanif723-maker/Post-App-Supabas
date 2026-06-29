import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const supabase_url = "https://bpcqmhunuupbcjpgyboz.supabase.co"
const publishable_key = "sb_publishable_lZYtDl-Jymf3hKzM_bDlnA_fNcsicie"

const supabase = createClient(supabase_url, publishable_key)
console.log(supabase);


async function register(event) {
    event.preventDefault()
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var password = document.getElementById("password").value
    var cpassword = document.getElementById("cpassword").value

    if (!name) {
        alert("Name is required")
    } else if (password !== cpassword) {
        alert("Passwords should be identical")
    } else {
        // localStorage.setItem("data",JSON.stringify(data))
        try {
            const { data, error } = await supabase.auth.signUp({ email, password })
            console.log(data);
            if(error)console.log(error);

        } catch (error) {
            console.log(error);
        } 
        alert(name + " Registered Successfully")
        // window.location.href = "/dashboard.html"
    }

}


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
          
          if(error){
            console.log(error);
            alert(error.message)
        } else {
            alert("Login Successful")
            window.location.href = "dashboard.html"
        }
    } catch (error) {
        console.log(error)
        alert("Login failed")
    }
}
function logout() {
    window.location.href = "/"
}

window.register= register
window.login = login