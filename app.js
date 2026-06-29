// Create a single supabase client for interacting with your database
var supabase = window.supabase.createClient(
  'https://bpcqmhunuupbcjpgyboz.supabase.co',
  'sb_publishable_lZYtDl-Jymf3hKzM_bDlnA_fNcsicie'
);

let editId = null;
let cardBg = "./images/1.jpg";

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

window.deletePost = deletePost;
window.editPost = editPost;
window.post = post;
window.selectImg = selectImg;