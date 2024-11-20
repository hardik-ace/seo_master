$(document).ready(function () {
  var menu_toggle = true;
  var search_toggle = true;
  $("#menu_icon_full").click(function (e) {
    if($(".header-content").hasClass("full-container")) {
      $('.header-content').removeClass("full-container");
      menu_toggle = true;
    } else {
      $('.header-content').addClass("full-container");
      menu_toggle = false;
    }

    if($(".leftside-fixed").hasClass("show")) {
      $('.leftside-fixed').removeClass("show");
      menu_toggle = true;
    } else {
      $('.leftside-fixed').addClass("show");
      menu_toggle = false;
    }
  })

  $("#menu_icon_small").click(function (e) {
    if($(".header-content").hasClass("full-container")) {
      $('.header-content').removeClass("full-container");
      menu_toggle = true;
    } else {
      $('.header-content').addClass("full-container");
      menu_toggle = false;
    }

    if($(".leftside-fixed").hasClass("show")) {
      $('.leftside-fixed').removeClass("show");
      menu_toggle = true;
    } else {
      $('.leftside-fixed').addClass("show");
      menu_toggle = false;
    }
    
  })

  // DataTable
  $(document).ready( function () {
    $('#table-first').DataTable();
  } );
  $(document).ready( function () {
    $('#table-second').DataTable();
  } );
  $(document).ready( function () {
    $('#table-third').DataTable();
  } );

  $(".btn-outline-secondary").click(function(e) {
    if(search_toggle == true) {
      $("#search").css("display", "block");
      search_toggle = false;
    } else {
      $("#search").css("display", "none");
      search_toggle = true;
    }
  })

});