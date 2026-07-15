// Single supabase client integration
var supabase = window.supabase.createClient(
  'https://uaryunimyhiwgcakbtai.supabase.co',
  'sb_publishable_wwdx3Mtpl3k6NPail9hlAA_6vXAlI3i'
);

let editId = null;
let cardBg = "./images/1.jpg";
let email;
let userId;
let userfirstname;

async function searchPosts() {
  let searchInput = document.getElementById("searchInput").value;
  try {
    const { data, error } = await supabase
      .from('Post app table')
      .select('*')
      .or(`title.ilike.%${searchInput}%,description.ilike.%${searchInput}%,user_name.ilike.%${searchInput}%`);
    renderdata(data);
    console.log("Search results:", data);


    if (error) console.log(error);
  } catch (error) {
    console.log(error);
  }
}
function renderdata(data) {
  const posts = document.getElementById("posts");
  if (!posts || !data)
    return;

  posts.innerHTML = "";

  let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  let headerTextColor = currentTheme === 'light' ? '#333333' : '#cbd5e1';

  data.forEach((post) => {
    posts.innerHTML += `
      <div class="card mb-3 text-section-card">
        <div class="card-header d-flex justify-content-between header-text-element" style="color: ${headerTextColor}; font-weight: 500;">
          <span>${post.id} ${post.user_name} <br> ~ 📧${post.email}</span>
        </div>
        <div style="background-image: url(${post.bg_img || './images/1.jpg'});" class="card-body">
          <h5 class="card-title">${post.title}</h5>
          <p class="card-text">${post.description}</p>
        </div>
        <div class="ms-auto m-2">
            <button onclick="editPost(event, ${post.id}, '${post.user_id}')" class="btn btn-success">Edit</button>
            <button onclick="deletePost(event, ${post.id}, '${post.user_id}')" class="btn btn-danger">Delete</button>
        </div>
      </div>`;
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const { data, error } = await supabase
      .from("Post app table")
      .select("*")
      .order("id", { ascending: false });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("User data:", user.user_metadata.first_name);
    if (user) {
      let firstname = user.user_metadata.first_name || "User";

      let firstchar = firstname.charAt(0).toUpperCase();
      document.getElementById("char").innerText = firstchar;
      document.getElementById("menuUserName").innerText = user.user_metadata.first_name;
      document.getElementById("menuUserEmail").innerText = user.email;
    }

    if (error) return;
    renderdata(data);
    // const posts = document.getElementById("posts");
    // if (!posts || !data) return;



    // // Theme ke mutabiq dynamic color check karne ke liye
    // let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    // let headerTextColor = currentTheme === 'light' ? '#333333' : '#cbd5e1';

    // data.forEach((post) => {
    //   posts.innerHTML += `
    //     <div class="card mb-3 text-section-card">
    //       <div class="card-header d-flex justify-content-between header-text-element" style="color: ${headerTextColor}; font-weight: 500;">
    //         <span>${post.id} ${post.user_name} <br> ~ 📧${post.email}</span>
    //       </div>
    //       <div style="background-image: url(${post.bg_img || './images/1.jpg'});" class="card-body">
    //         <h5 class="card-title">${post.title}</h5>
    //         <p class="card-text">${post.description}</p>
    //       </div>
    //       <div class="ms-auto m-2">
    //           <button onclick="editPost(event, ${post.id}, '${post.user_id}')" class="btn btn-success">Edit</button>
    //           <button onclick="deletePost(event, ${post.id}, '${post.user_id}')" class="btn btn-danger">Delete</button>
    //       </div>
    //     </div>`;
    // });
  } catch (error) {
    console.log(error);
  }
});



async function deletePost(event, id, userId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      Swal.fire({ icon: "error", title: "Authentication Error", text: "You must be logged in to delete posts." });
      return;
    }
    const { error } = await supabase.from("Post app table").delete().eq("id", id);
    if (!error) event.target.closest(".card")?.remove();
  } catch (error) { console.log(error); }
}

async function editPost(event, id, userId) {
  const card = event.target.closest(".card");
  const title = card?.querySelector(".card-title")?.textContent?.trim() || "";
  const description = card?.querySelector(".card-text")?.textContent?.trim() || "";

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      Swal.fire({ icon: "error", title: "Authentication Error", text: "You must be logged in to edit posts." });
      return;
    }
    document.getElementById("title").value = title;
    document.getElementById("description").value = description;
    card?.remove();
    editId = id;
    if (document.getElementById("postBtn")) document.getElementById("postBtn").innerText = "Update Post";
  } catch (error) { console.log(error); }
}


async function post(event) {
  if (event) event.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  var imageFile = document.getElementById("background-image").files[0];
  // console.log("Selected image file:", imageFile);

  if (!title || !description) {
    Swal.fire({ icon: "error", title: "Empty Post...", text: "Enter title & description" });
    return;
  }
  let imageUrl;
  if (imageFile) {
    let filename = `${Date.now()}-`;
    console.log(filename);

    const { error: uploadError } = await supabase.storage.from('post-images').upload(filename, imageFile, {
      cacheControl: '3600',
      upsert: false
    });

    if (uploadError) {
      Swal.fire({ icon: "error", title: "Image Upload Error", text: uploadError.message });
      console.log("Image upload error:", uploadError);
      return;
    }
    const { data: publicUrlData } = supabase
      .storage
      .from('post-images')
      .getPublicUrl(filename);
    imageUrl = publicUrlData.publicUrl;

  } else if (cardBg) {
    imageUrl = cardBg;
  } else {
    swal.fire({ icon: "error", title: "No Image Selected", text: "Please select an image for the post." });
    return;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    email = user.email;
    userId = user.id;
    userfirstname = user.user_metadata.first_name;

    if (editId) {
      await supabase.from("Post app table").update({ title, description, bg_img: imageUrl, user_id: userId, user_name: userfirstname }).eq("id", editId);
    } else {
      await supabase.from("Post app table").insert({ title, description, bg_img: imageUrl, email: email, user_id: userId, user_name: userfirstname });
    }
    renderdata(await supabase.from("Post app table").select("*").order("id", { ascending: false }).then(res => res.data));
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    editId = null;
    if (document.getElementById("postBtn")) document.getElementById("postBtn").innerText = "Post";
    // location.reload();
  } catch (error) { console.log(error); }
}


function selectImg(src, event) {
  cardBg = src;

  // 1. Sabhi images se selection hatayein
  const bgImg = document.getElementsByClassName("bgImg");
  for (let i = 0; i < bgImg.length; i++) {
    bgImg[i].className = "bgImg";
  }

  // 2. Click ki hui image par selectImg class lagayein
  event.target.classList.add("selectedImg");

  // 3. Preview Box ko 100px par show karne ka sahi tarika
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewBox = document.getElementById("imagePreview");

  if (previewContainer && previewBox) {
    previewContainer.style.display = "block"; // Box ko screen par dikhao
    previewBox.style.backgroundImage = "url('" + src + "')"; // Image set karo
  }
}

const themeToggleBtn = document.getElementById('theme-toggle');
const rootElement = document.documentElement;
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = rootElement.getAttribute('data-theme');
  let nextTheme = currentTheme === 'light' ? 'dark' : 'light';

  if (nextTheme === 'light') {
    rootElement.setAttribute('data-theme', 'light');
    themeToggleBtn.innerHTML = '☀️ Dark Mode';
  } else {
    rootElement.removeAttribute('data-theme');
    themeToggleBtn.innerHTML = '🌙 Light Mode';
  }

  // Theme toggle hote hi header ke text ka color automatic change ho jaye
  const headerElements = document.querySelectorAll('.header-text-element');
  headerElements.forEach(el => {
    el.style.color = nextTheme === "light" ? "#333333" : "#cbd5e1";
  });
});

async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Swal.fire({ title: 'Error!', text: error.message, icon: 'error' });
      return;
    }
    Swal.fire({ title: 'Success!', text: 'Logout Successful', icon: 'success' });
    setTimeout(() => { window.location.href = "index.html" }, 1500);
  } catch (err) { console.log(err); }
}

function toggleProfileMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("profileMenu");
  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}
window.toggleProfileMenu = toggleProfileMenu;

window.addEventListener("click", () => {
  const menu = document.getElementById("profileMenu");
  if (menu) menu.style.display = "none";
});

// Bindings
window.deletePost = deletePost;
window.editPost = editPost;
window.post = post;
window.selectImg = selectImg;
window.logout = logout;
window.toggleProfileMenu = toggleProfileMenu;
window.searchPosts = searchPosts;

document.addEventListener("DOMContentLoaded", () => {
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});

// Jab aap '+' par click karke computer se koi bhi picture select karengi, 
// to yeh code us picture ko 100px wale preview box mein dikha dega.

document.getElementById("background-image").addEventListener("change", function (event) {
  const file = event.target.files[0]; // Jo file select hui usko pakda

  if (file) {
    const reader = new FileReader(); // Browser ka file reader shuru kiya

    reader.onload = function (e) {
      const previewContainer = document.getElementById("imagePreviewContainer");
      const previewBox = document.getElementById("imagePreview");

      if (previewContainer && previewBox) {
        previewContainer.style.display = "block"; // 100px wale container ko show kiya
        previewBox.style.backgroundImage = `url(${e.target.result})`; // Selected picture ko background lagaya
      }
    }

    reader.readAsDataURL(file); // File ko read karna shuru kiya
  }
});
supabase
  .channel('post channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public' ,table :"Post app table"},async payload => {

    renderdata(await supabase.from("Post app table").select("*").order("id", { ascending: false }).then(res => res.data));

    if(error) console.log(error);

    console.log('Change received!', payload)
  })
  .subscribe((status) => {
   console.log('Subscription status:', status);
  }
)