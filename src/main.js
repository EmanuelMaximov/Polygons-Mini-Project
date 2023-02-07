var coords = [];
var polygons=[];
var pushed_first_element=false;
var color_pen='black';
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

var edit_mode=false;
var clicked_nodes=[];


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
        coords.push([x,y,color_pen]);
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

        coords.push([x,y,color_pen]);
        if (!pushed_first_element){
          current_polygon_index++;
          polygons.push(coords);
          pushed_first_element=true;
        }
        polygons[current_polygon_index]=coords;
        // coords[coords.length-1].push(y);
        $("#xCoord, #yCoord, #submit").css("visibility","hidden");

        drawPolygon();
        $("#noCoords").text("Number of co-ordinates: "+coords.length);
      }
    }


  });

  function drawDashedLine(b,d) {
    var line_width=c.lineWidth;
    c.lineWidth=line_width+3;
    c.setLineDash([10, 10]);
    c.beginPath();
    c.moveTo(parseInt(b[0],10),output(parseInt(b[1],10)));
    c.lineTo(parseInt(d[0],10),output(parseInt(d[1],10)));
    c.stroke();
    c.lineWidth=line_width;
    c.setLineDash([]);
  }

  function drawDashedPolygon() {
    for (var i = 0; i < coords.length; i++) {
      if (i == coords.length - 1) {
        drawDashedLine(coords[i], coords[0]);
      } else {
        drawDashedLine(coords[i], coords[i + 1]);
      }
    }
  }



  $("#remove_node").on('click', function(e){
    $("#remove_node, #change_node_color").css("visibility","hidden");
    var new_coords=[];
    for (var i=0; i<coords.length;i++){
      if (clicked_nodes.indexOf(i) === -1){
        new_coords.push(coords[i]);
      }
    }
    coords=new_coords;
    clicked_nodes=[];

    polygons[current_polygon_index]=coords;

    drawPolygon();
  });

  // remove nodes on edit mode
  $("#graph").on('click', function(e){
    const x = e.offsetX;
    const y = canvas_height-e.offsetY;
   if (edit_mode){

     for (var k = 0; k < coords.length; k++) {
       if (x-5 <= coords[k][0] && x+5 >= coords[k][0] && y-5 <= coords[k][1] && y+5 >= coords[k][1]) {
         clicked_nodes.push(k);
         $("#remove_node, #change_node_color").css("visibility","visible");
         var fillstyle=c.fillStyle;
         c.fillStyle='red';
         // c.lineWidth=c.lineWidth+5;
         c.fillRect(coords[k][0]-5,output(coords[k][1])-5,10,10);
         c.stroke();
         c.fillStyle=fillstyle;
         break;
       }
     }
   }
  });

  // edit polygon
  $("#graph").on('contextmenu', function(e){
    e.preventDefault();
    polygons[current_polygon_index]=coords;
    const x = e.offsetX;
    const y = canvas_height-e.offsetY;
    var index=checkOnEdge([x,y]);
    if (index!=-1){
      edit_mode=true;
      current_polygon_index=index;
      coords=polygons[index];
      polygons[current_polygon_index]=coords;
      drawPolygon();
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

  $("#add_polygon").click(function() {
    if (!pushed_first_element){
      polygons.push(coords);
    }
    else{
      pushed_first_element=true;
    }
    current_polygon_index=polygons.length;
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
    edit_mode=false;
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
    color_pen = $(this).val();
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

  function checkOnEdge(clicked_coord){
    for (var i = 0; i < polygons.length; i++) {
      for (var j = 0; j < polygons[i].length-1; j++) {
        if (checkOnLine(polygons[i][j],polygons[i][j+1],clicked_coord)) {
            return i
        }
      }
      // check first and last coords of the same polygon
      if (checkOnLine(polygons[i][0],polygons[i][polygons[i].length-1],clicked_coord)) {
        return i
      }
    }
    return -1
  }

  function checkOnLine(a,b,clicked_coord) {
    const threshold = 25;

    // Calculate the distance between the mouse click position and the line
    const A = b[0]-a[0];
    const B = a[1]-clicked_coord[1];
    const C = a[0] - clicked_coord[0];
    const D = b[1] - a[1];
    const dist = Math.abs(A * B - C * D) / Math.sqrt(A * A + D * D);

    if (dist <= threshold &&
      (clicked_coord[0]>=Math.min(a[0],b[0])-threshold && clicked_coord[0]<=Math.max(a[0],b[0])+threshold) &&
      (clicked_coord[1]>=Math.min(a[1],b[1])-threshold && clicked_coord[1]<=Math.max(a[1],b[1])+threshold)){
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
          c.strokeStyle=polygons[j][i][2];
          drawLine(polygons[j][i],polygons[j][0]);
        } else {
          c.strokeStyle=polygons[j][i+1][2];
          drawLine(polygons[j][i],polygons[j][i+1]);
        }
      }
    }
    drawDashedPolygon();

  }
  function output(d) {
    return canvas_height-d;
  }


});
