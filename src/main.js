var coords = [];
var pointCheck = false;
var clickCheck = false;
var newCoordCheck = false;
var showCoordsCheck = true;

$(document).ready(function(){

  var c = document.getElementById("graph").getContext('2d');
  c.lineWidth = 3;

  $("#graph").mousemove(function(e) {
    x = undefined?e.layerX:e.offsetX;
    y = output(undefined?e.layerY:e.offsetY);

    if (clickCheck) {
      coords[pointChange][0] = x;
      coords[pointChange][1] = y;
      drawPolygon();
    } else {
      $("html, body").css("cursor","crosshair");
      pointCheck = false;
      for (var k = 0; k < coords.length; k++) {
        if (x-5 <= coords[k][0] && x+5 >= coords[k][0] && y-5 <= coords[k][1] && y+5 >= coords[k][1]) {
          $("html, body").css("cursor","grab");
          pointCheck = true;
          pointChange = k;
          break;
        }
      }
    }
  });

  $("#graph").mousedown(function(e) {
    if (pointCheck) {
      clickCheck = true;
      $("html, body").css("cursor","grabbing");
    }
  });

  $("#graph").mouseup(function(e) {
    if (clickCheck) {
      clickCheck = false;
      $("html, body").css("cursor","grab");
    } else if (newCoordCheck) {
      coords.push([x]);
      coords[coords.length-1].push(y);
      $("#xCoord, #yCoord, #submit").css("visibility","hidden");
      drawPolygon();
      $("#noCoords").text("Number of co-ordinates: "+coords.length);
      newCoordCheck = false;
    }
  });

  $("#graph").dblclick(function(e) {
    if (!pointCheck) {
      coords.push([x]);
      coords[coords.length-1].push(y);
      $("#xCoord, #yCoord, #submit").css("visibility","hidden");
      drawPolygon();
      $("#noCoords").text("Number of co-ordinates: "+coords.length);
    }
  });

  $("#showCoords").change(function() {
    if (this.checked) {
      showCoordsCheck = true;
    } else {
      showCoordsCheck = false;
    }
    drawPolygon();
  });

  $("#newCoord").click(function() {
    $("#xCoord, #yCoord, #submit, #cancel").css("visibility","visible");
    newCoordCheck = true;
  });

  $("#submit").click(function() {
    var x_coord = $("#xCoord").val();
    var y_coord = $("#yCoord").val();

    if (x_coord == "" || y_coord == "")
    {
      alert("Fields must contain a number.")
      return;
    }

    coords.push([$("#xCoord").val()]);
    coords[coords.length-1].push($("#yCoord").val());
    $("#xCoord, #yCoord, #submit, #cancel").css("visibility","hidden");
    drawPolygon();
    $("#noCoords").text("Number of coordinates: "+coords.length);
    $("#xCoord").val("");
    $("#yCoord").val("");
    newCoordCheck = false;
  });


  $("#cancel").click(function() {
    $("#xCoord, #yCoord, #submit, #cancel").css("visibility","hidden");
  });

  $("#clear").click(function() {
    coords = [];
    c.clearRect(0,0,760,640);
    $("#area").html("Area of polygon: 0 units<sup>2</sup>");
    $("#perimeter").text("Perimeter of polygon: 0 units");
    $("#noCoords").text("Number of coordinates: 0");
  });


  $("#ImgUrl").click(function() {
    var Url_input = $("#Urlinput").val();
    if (Url_input == "")
    {
      alert("Field must contain a image name.")
      return;
    }
    $("#graph").css("background-image", "url(Images/" + String(Url_input) + ")");
    $("#Urlinput,#ImgUrl,#imgtext,#cancelimg").css("visibility","hidden");
    $("#imgbtn").css("visibility","visible");
  });

  $("#imgbtn").click(function() {
    $("#imgbtn").css("visibility","hidden");
    $("#Urlinput,#ImgUrl,#imgtext,#cancelimg").css("visibility","visible");
  });
  $("#cancelimg").click(function() {
    $("#Urlinput,#ImgUrl,#imgtext,#cancelimg").css("visibility","hidden");
    $("#imgbtn").css("visibility","visible");
  });

  // Display a cross for each co-ordinate and the numbers if required
  function displayCoord(a) {
    c.beginPath();
    c.moveTo(parseInt(a[0],10)-3,output(parseInt(a[1],10)-3));
    c.lineTo(parseInt(a[0],10)+3,output(parseInt(a[1],10)+3));
    c.stroke();
    c.beginPath();
    c.moveTo(parseInt(a[0],10)-3,output(parseInt(a[1],10)+3));
    c.lineTo(parseInt(a[0],10)+3,output(parseInt(a[1],10)-3));
    c.stroke();
    if (showCoordsCheck) c.fillText("("+a[0]+","+a[1]+")",parseInt(a[0],10)+10,output(parseInt(a[1],10)+10));
  }

  // Draw a line between co-ordinates
  function drawLine(b,d) {
    c.beginPath();
    c.moveTo(parseInt(b[0],10),output(parseInt(b[1],10)));
    c.lineTo(parseInt(d[0],10),output(parseInt(d[1],10)));
    c.stroke();
  }

  function drawPolygon() {
    c.clearRect(0,0,760,640);
    for (var i = 0; i < coords.length; i++) {
      displayCoord(coords[i]);
      if (i == coords.length-1) {
        drawLine(coords[i],coords[0]);
      } else {
        drawLine(coords[i],coords[i+1]);
      }
    }
  }
  function output(d) {
    return 640-d;
  }
});
