const updateStarred = (hospital_name, was_active) => {
  const user_id  = JSON.parse(document.getElementById('user_id').textContent);

    $.ajax({
        type: "POST",
        url: `/favorite`,
        dataType: "json",
        data: JSON.stringify({
          "hospital_name" : hospital_name,
          "was_active" : was_active,
          "user_id" : user_id
        }),
        success: () => {
        },
        error: (jqXHR, exception) => {
          console.error(exception, jqXHR)
        }
      })
}
$(document).on('click', '.star-inactive',(e) => {
    updateStarred(e.target.name, false)
    window.location.reload()
})
$(document).on('click', '.star-active',(e) => {
    updateStarred(e.target.name, true)
    window.location.reload()
})

