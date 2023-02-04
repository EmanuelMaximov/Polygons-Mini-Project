var coords = [];
var polygons=[];
var current_polygon_index=-1;
var pointCheck = false;
var clickCheck = false;
var newCoordCheck = false;
var showCoordsCheck = true;
var canvas_width = 840;
var canvas_height = 560;
var img = new Image();
var image_is_inserted=false;

//zoom support
var zoom_activated = false;
var translatePos = {
  x: canvas_width / 2,
  y: canvas_height / 2
};
var zoomMouseDown = false;
var zoom_startDragOffset ={};
var scale = 1.0;


$(document).ready(function(){

  var canv = document.getElementById("graph");
  canv.width = canvas_width;
  canv.height = canvas_height;
  var c=canv.getContext('2d');



  $("#graph").mousemove(function(e) {
    x = undefined?e.layerX:e.offsetX;
    y = output(undefined?e.layerY:e.offsetY);

    //for zoom in
    if (zoomMouseDown && zoom_activated) {
      c.clearRect(0,0,canvas_width,canvas_height);
      translatePos.x = e.clientX - zoom_startDragOffset.x;
      translatePos.y = e.clientY - zoom_startDragOffset.y;
      c.save();
      c.translate(translatePos.x, translatePos.y);
      c.scale(scale, scale);
      drawPolygon();
      c.restore();
    }

    else{
      if (clickCheck) {
        coords[pointChange][0] = x;
        coords[pointChange][1] = y;
        drawPolygon();
      } else {
        $("html, body").css("cursor","default");
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
    }
  });

  $("#graph").mousedown(function(e) {

    //for zoom in
    if (zoom_activated){
      zoomMouseDown = true;
      zoom_startDragOffset.x=  e.clientX - translatePos.x;
      zoom_startDragOffset.y=  e.clientY - translatePos.y;
    }
    else{
      if (pointCheck) {
        clickCheck = true;
        $("html, body").css("cursor","grabbing");
      }
    }
  });

  $("#graph").mouseup(function(e) {

    //for zoom in
    if (zoom_activated){
      zoomMouseDown = false;
    }
    else{
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
    }
  });

  $("#graph").mouseover(function(e) {
    //for zoom
    if (zoom_activated){
      zoomMouseDown = false;
    }
  });

  $("#graph").mouseout(function(e) {
    //for zoom
    if (zoom_activated){
      zoomMouseDown = false;
    }
  });

  $("#graph").dblclick(function(e) {

    if (zoom_activated){
      alert("Reset zoom mode in order to add nodes")
    }
    else{
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
    }


  });

  // // edit polygon
  // $("#graph").click(function(e) {
  //   polygons[current_polygon_index]=coords;
  //   var index=checkOnEdge([x,y],polygons);
  //
  //   if (index!=-1){
  //     alert(index)
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
    image_is_inserted=false;
    c.clearRect(0,0,canvas_width,canvas_height);
    document.getElementById('my-range').value = 0;
    zoom_activated=false;
    zoomMouseDown = false;
  });

  function load_image(){
    image_is_inserted=true;
    // insert new image to canvas
    var hRatio = canvas_width / img.width    ;
    var vRatio =  canvas_height / img.height  ;
    var ratio  = Math.min ( hRatio, vRatio );
    var centerShift_x = ( canvas_width - img.width*ratio ) / 2;
    var centerShift_y = ( canvas_height - img.height*ratio ) / 2;
    c.clearRect(0,0,canvas_width,canvas_height);
    c.drawImage(img, 0,0, img.width, img.height,
      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
  }




  $("#reset_zoom").click(function() {
    document.getElementById('my-range').value = 0;
    zoom_activated=false;
    zoomMouseDown = false;
    drawPolygon();
  });


  //zoom option
  $("#my-range").on("change", function() {
    const rangeInput = document.getElementById("my-range");
    rangeInput.setAttribute("title", this.value);
    c.clearRect(0,0,canvas_width,canvas_height);
    scale=$(this).val();
    if (scale!=1){
      zoom_activated=true;
      c.save();
      c.translate(translatePos.x, translatePos.y);
      c.scale(scale, scale);
      drawPolygon();
      c.restore();
    }
    else {
      zoom_activated=false;
      zoomMouseDown = false;
      drawPolygon();
    }


  });


  //pen color option
  $("#my-pen-color").on("change", function() {
    c.strokeStyle = $(this).val();
  });

  $("#my-pen-width").on("change", function() {
    const pen_width = document.getElementById("my-pen-width");
    pen_width.setAttribute("title", this.value);
    c.lineWidth = $(this).val();
  });

  $("#inputFile").on("change", function(e) {
    var f = e.target.files[0];
    var fr = new FileReader();

    fr.onload = function(ev2) {
      console.dir(ev2);

      img.onload = load_image;
      img.src = ev2.target.result;
      coords = [];
      polygons[current_polygon_index]=coords;

    };

    fr.readAsDataURL(f);

  });


  $("#export_json").click(function() {
    const originalData = JSON.parse(JSON.stringify(polygons));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(originalData, null, 2)], {
      type: "application/json"
    }));
    a.setAttribute("download", "Polygons data.json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("Polygons data was exported to JSON file successfully!")
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

  function checkOnLine(a,b,clicked_coord) {
    var m = (a[1] - b[1]) / (a[0] - b[0])
    if ((clicked_coord[1] - a[1] == m * (clicked_coord[0] - a[0])) &&
      (clicked_coord[0]>=Math.min(a[0],b[0]) && clicked_coord[0]<=Math.max(a[0],b[0])) &&
      (clicked_coord[1]>=Math.min(a[1],b[1]) && clicked_coord[1]<=Math.max(a[1],b[1]))) {
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
    if (image_is_inserted){
      load_image();
    }
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
