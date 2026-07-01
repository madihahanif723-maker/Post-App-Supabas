// Create a single supabase client for interacting with your database
var supabase = window.supabase.createClient(
  'https://bpcqmhunuupbcjpgyboz.supabase.co',
  'sb_publishable_lZYtDl-Jymf3hKzM_bDlnA_fNcsicie'
);

let editId = null;
let cardBg = "./images/1.jpg";

async function searchPosts() {
  let searchInput = document.getElementById("searchInput").value
  console.log(searchInput);
  try {
    //   const { data, error } = await supabase
    // .from('My Posts')
    // .select("*").order('id', { ascending: false })
    // .ilike('title', `%${searchInput}%`)

    const { data, error } = await supabase
      .from('Post app table')
      .select('*')
      .or(`title.ilike.%${searchInput}%,description.ilike.%${searchInput}%`)

    var posts = document.getElementById("posts")
    posts.innerHTML = ""
    data.forEach(post => {
      posts.innerHTML += `
    <div class="card mb-2">
             <div class="card-header">${post.id} ~Post</div>
             <div style="background-image:url(${post.bg_img})" class="card-body">
               <figure>
                 <blockquote class="blockquote">
                   <p>
                     ${post.title}
                   </p>
                 </blockquote>
                 <figcaption class="blockquote-footer">
                   ${post.description}
                 </figcaption>
               </figure>
             </div>
             <div class="ms-auto m-2">
             <button onclick="editPost(event,${post.id},'${post.description}','${post.title}','${post.bg_img}')" class="btn btn-success">Edit</button>
             <button onclick="deletePost(event,${post.id})" class="btn btn-danger">Delete</button>
             </div>
           </div>
   `})

    console.log(data);
    if (!data.length) {
      posts.innerHTML = "No posts Found"
    }

    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }

}




window.addEventListener("DOMContentLoaded", async () => {
  try {
    const { data, error } = await supabase
      .from("Post app table")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("load error", error);
      return;
    }

    const posts = document.getElementById("posts");
    if (!posts || !data) return;

    posts.innerHTML = "";
    data.forEach((post) => {
      posts.innerHTML += `
            <div class="card m-2">
              <div class="card-header">@Post ${post.id}</div>
              <div style="background-image: url(${post.bg_img || './images/1.jpg'});" class="card-body">
                <h5 class="card-title">${post.title}</h5>
                <p class="card-text">${post.description}</p>
              </div>
              <div class="ms-auto m-2">
                  <button onclick="editPost(event, ${post.id})" class="btn btn-success">Edit</button>
                  <button onclick="deletePost(event, ${post.id})" class="btn btn-danger">Delete</button>
               </div>
            </div>
            `;
    });
  } catch (error) {
    console.log(error);
  }
});

async function deletePost(event, id) {
  try {
    const { error } = await supabase.from("Post app table").delete().eq("id", id);
    if (error) {
      console.log("delete error", error);
      return;
    }

    const card = event.target.closest(".card");
    if (card) card.remove();
  } catch (error) {
    console.log(error);
  }
}

function editPost(event, id) {
  const card = event.target.closest(".card");
  const title = card?.querySelector(".card-title")?.textContent?.trim() || "";
  const description = card?.querySelector(".card-text")?.textContent?.trim() || "";

  document.getElementById("title").value = title;
  document.getElementById("description").value = description;
  card?.remove();
  editId = id;

  const postBtn = document.getElementById("postBtn");
  if (postBtn) postBtn.innerText = "Update Post";
}

async function post(event) {
  if (event) event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !description) {
    Swal.fire({
      icon: "error",
      title: "Empty Post...",
      text: "Enter title & description",
      background: '#1a1a2e',
      color: '#fff',
      confirmButtonColor: '#ab47bc'
    });
    return;
  }

  try {
    if (editId) {
      const { error } = await supabase
        .from("Post app table")
        .update({ title, description, bg_img: cardBg })
        .eq("id", editId)
        .select("*");

      if (error) {
        console.log("update error", error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("Post app table")
        .insert({ title, description, bg_img: cardBg })
        .select("*");

      if (error) {
        console.log("Post error: ", error);
        return;
      }
    }

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    editId = null;

    const postBtn = document.getElementById("postBtn");
    if (postBtn) postBtn.innerText = "Post";

    location.reload();
  } catch (error) {
    console.log(error);
  }
}

function selectImg(src, event) {
  cardBg = src;
  const bgImg = document.getElementsByClassName("bgImg");
  for (let i = 0; i < bgImg.length; i++) {
    bgImg[i].className = "bgImg";
  }
  event.target.classList.add("selectedImg");
}

// Button aur HTML tag ko select karein
const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
  // Check karein ke abhi kaunsi theme chal rahi hai
  const currentTheme = rootElement.getAttribute('data-theme');

  if (currentTheme === 'light') {
    // Agar light hai toh dark kar do
    rootElement.removeAttribute('data-theme');
    themeToggleBtn.innerHTML = '🌙 Light Mode';
  } else {
    // Agar dark hai toh light kar do
    rootElement.setAttribute('data-theme', 'light');
    themeToggleBtn.innerHTML = '☀️ Dark Mode';
  }
});

// ==========================================
// 3. LOGOUT FUNCTION (Fixed)
// ==========================================
async function logout() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.log(error)
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
                background: '#1a1a2e',
                color: '#fff',
                confirmButtonColor: '#ab47bc'
            });
            return
        }
        
        Swal.fire({
            title: 'Success!',
            text: 'Logout Successful',
            icon: 'success',
            background: '#1a1a2e',
            color: '#fff',
            confirmButtonColor: '#ab47bc'
        });
        
        setTimeout(() => {
            window.location.href = "index.html"
        }, 1500);

    } catch (err) {
        console.log(err)
        Swal.fire({
            title: 'Error!',
            text: 'Logout failed',
            icon: 'error',
            background: '#1a1a2e',
            color: '#fff',
            confirmButtonColor: '#ab47bc'
        });
    }
}



window.deletePost = deletePost;
window.editPost = editPost;
window.post = post;
window.selectImg = selectImg;
window.logout = logout


document.addEventListener("DOMContentLoaded", () => {
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});