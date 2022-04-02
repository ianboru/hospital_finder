const updateStarred = (hospital_name, was_active) => {
    $.ajax({
        type: "POST",
        url: `/favorite`,
        dataType: "json",
        data: JSON.stringify({
          "hospital_name" : hospital_name,
          "was_active" : was_active
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

