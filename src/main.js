var coords = [];
var polygons=[];
var current_polygon_index=-1;
var pointCheck = false;
var clickCheck = false;
var newCoordCheck = false;
var showCoordsCheck = true;
var canvas_width = 500;
var canvas_height = 500;
var polygons_line_width = 5;
var polygons_line_color = 'black';

$(document).ready(function(){

  var ctx = document.getElementById("graph");
  ctx.width = canvas_width;
  ctx.height = canvas_height;
  var c=ctx.getContext('2d');
  c.lineWidth = polygons_line_width;
  c.strokeStyle = polygons_line_color;


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
      coords.push([x,y]);
      // coords[coords.length-1].push(y);
      $("#xCoord, #yCoord, #submit").css("visibility","hidden");
      drawPolygon();
      $("#noCoords").text("Number of co-ordinates: "+coords.length);
      newCoordCheck = false;
    }
  });

  $("#graph").dblclick(function(e) {
    if (!pointCheck) {

      coords.push([x,y]);
      if (current_polygon_index==-1){
        current_polygon_index++;
        polygons.push(coords);
      }
      polygons[current_polygon_index]=coords;
      // coords[coords.length-1].push(y);
      $("#xCoord, #yCoord, #submit").css("visibility","hidden");

      drawPolygon();
      $("#noCoords").text("Number of co-ordinates: "+coords.length);
    }
  });

  // // edit polygon
  // $("#graph").click(function(e) {
  //   polygons[current_polygon_index]=coords;
  //   var index=checkOnEdge([x,y],polygons);
  //   if (index!=-1){
  //
  //     coords=polygons[index];
  //   }
  // });



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

  $("#add_polygon").click(function() {
    if (current_polygon_index>0){
      polygons.push(coords);
    }
    current_polygon_index++;
    coords=[];
  });

  $("#cancel").click(function() {
    $("#xCoord, #yCoord, #submit, #cancel").css("visibility","hidden");
  });

  $("#clear").click(function() {
    coords = [];
    polygons=[];
    current_polygon_index=-1;
    c.clearRect(0,0,canvas_width,canvas_height);
  });


  $("#ImgUrl").click(function() {
    var Url_input = $("#Urlinput").val();
    if (Url_input == "")
    {
      alert("Field must contain a image name.")
      return;
    }

    var image = new Image();
    image.onload = function () {
      $("#my_image").attr("src", this.src);

      // clear canvas
      coords = [];
      c.clearRect(0,0,canvas_width,canvas_height);

      // insert new image to canvas
      $("#graph").css("background-image", "url(Images/" + String(Url_input) + ")");
    };
    image.src = "Images/" + String(Url_input);


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


  function checkOnEdge(clicked_coord,polygons_coords){
    for (var i = 0; i < polygons_coords.length; i++) {
      for (var j = 1; i < polygons_coords[i].length; j++) {
        if (checkOnLine(polygons_coords[i][0],polygons_coords[i][j],clicked_coord)) {
            return i
        }
      }
    }
    return -1
  }
  function max(a,b){
    if (a>b){
      return a
    }
    return b
  }

  function min(a,b){
    if (a<b){
      return a
    }
    return b
  }

  function checkOnLine(a,b,clicked_coord) {
    var m = (a[1] - b[1]) / (a[0] - b[0])
    if ((clicked_coord[1] - a[1] == m * (clicked_coord[0] - a[0])) &&
      (clicked_coord[0]>=min(a[0],b[0]) && clicked_coord[0]<=max(a[0],b[0])) &&
      (clicked_coord[1]>=min(a[1],b[1]) && clicked_coord[1]<=max(a[1],b[1]))) {
      return true
    }
    return false
  }
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
    c.clearRect(0,0,canvas_width,canvas_height);
    for (var j = 0; j < polygons.length; j++) {
      for (var i = 0; i < polygons[j].length; i++) {
        displayCoord(polygons[j][i]);
        if (i == polygons[j].length-1) {
          drawLine(polygons[j][i],polygons[j][0]);
        } else {
          drawLine(polygons[j][i],polygons[j][i+1]);
        }
      }
    }
  }
  function output(d) {
    return canvas_height-d;
  }
});
