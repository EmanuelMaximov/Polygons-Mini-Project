let canvas_width = 750;
let canvas_height = 450;

let polygons=[];
let polygons_line_width=[];
let current_polygon_index=-1;
let coords = [];
let color_pen='black';
let edge_width=2;

//Global Flags
let added_polygon=false;
let pointCheck = false;
let clickCheck = false;
let showCoordsCheck = true;
//Image Loading Support
let img = new Image();
let image_is_inserted=false;
//Zoom support
let zoom_activated = false;
let zoomMouseDown = false;
let translatePos = {x: 0, y: 0};
let zoom_startDragOffset ={x: 0, y: 0};
let scale = 1.0;
//Editing support
let edit_mode=false;
let clicked_nodes=[];
let select_nodes=false;
let drag_start=[0,0];
let drag_polygon=false;


$(document).ready(function(){

  //Get Canvas instance
  let canvas = document.getElementById("graph");
  //Set canvas width and height
  canvas.width = canvas_width;
  canvas.height = canvas_height;
  let c=canvas.getContext('2d');


  // ---------------------------------------- Events Listeners ----------------------------------------

  $("#graph").mousemove(function(e) {
    x = undefined?e.layerX:e.offsetX;
    y = output(undefined?e.layerY:e.offsetY);

    //for zoom in
    if (zoom_activated) {
      if (zoomMouseDown) {
        c.clearRect(0, 0, canvas_width, canvas_height);
        translatePos.x = e.clientX - zoom_startDragOffset.x;
        translatePos.y = e.clientY - zoom_startDragOffset.y;
        c.save();
        c.translate(translatePos.x, translatePos.y);
        c.scale(scale, scale);
        drawPolygons();
        c.restore();
      }
    } else {
      $("html, body").css("cursor","default");
      if (edit_mode){
        const x = e.offsetX;
        const y = canvas_height-e.offsetY;
        let index=checkOnEdge([x,y],true);
        if (index!=-1 && index==current_polygon_index){
          $("html, body").css("cursor","move");
          if (drag_polygon && !clickCheck){
            // get the current mouse position
            let mx=e.clientX;
            let my=output(e.clientY);
            // calculate the distance the mouse has moved
            // since the last mousemove
            let dx=mx-drag_start[0];
            let dy=my-drag_start[1];

            for (let k = 0; k < coords.length; k++) {
              coords[k][0] += dx;
              coords[k][1] += dy;
            }
            drawPolygons();
            //update starting position
            drag_start[0]=mx;
            drag_start[1]=my;
          }
        }
      }

      if (clickCheck) {
        coords[pointChange][0] = x;
        coords[pointChange][1] = y;
        drawPolygons();
      } else {
        pointCheck = false;
        for (let k = 0; k < coords.length; k++) {
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
    if (edit_mode){
      drag_polygon=true;
      //get current mouse position
      drag_start[0]=e.clientX;
      drag_start[1]=output(e.clientY);
    }

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
    drag_polygon=false;
    //for zoom in
    if (zoom_activated){
      zoomMouseDown = false;
    }
    else{
      if (clickCheck) {
        clickCheck = false;
        $("html, body").css("cursor","grab");
      }
    }
  });

  $("#graph").mouseover(function(e) {
    drag_polygon=false;
    //for zoom
    if (zoom_activated){
      zoomMouseDown = false;
    }
  });

  $("#graph").mouseout(function(e) {
    drag_polygon=false;
    //for zoom
    if (zoom_activated){
      zoomMouseDown = false;
    }
  });

  $("#graph").dblclick(function(e) {

    if (zoom_activated){
      alert("view-mode: Reset zoom in order to add nodes")
    }
    else{
      if (!pointCheck & added_polygon) {
        coords.push([x,y,color_pen]);
        polygons[current_polygon_index]=coords;
        drawPolygons();
      }
    }

  });

  // remove nodes on edit mode
  $("#graph").on('click', function(e){
    const x = e.offsetX;
    const y = canvas_height-e.offsetY;
   if (edit_mode && select_nodes){

     for (let k = 0; k < coords.length; k++) {
       if (x-5 <= coords[k][0] && x+5 >= coords[k][0] && y-5 <= coords[k][1] && y+5 >= coords[k][1]) {

         const ind=clicked_nodes.indexOf(k);
         if (ind === -1){
           clicked_nodes.push(k);
         }
         else{
           clicked_nodes.splice(ind,1);
         }

         if (clicked_nodes.length==0){
           $("#remove_node").css("visibility","hidden");
         }
         else{
           $("#remove_node").css("visibility","visible");
         }

         drawRects();
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
    let index=checkOnEdge([x,y],false);
    if (index!=-1){
      edit_mode=true;
      current_polygon_index=index;
      coords=polygons[index];
      polygons[current_polygon_index]=coords;
      drawPolygons();
    }
  });


  // ---------------------------------------- Buttons ----------------------------------------

  // Load Image file button
  $("#inputFile").on("change", function(e) {
    let f = e.target.files[0];
    let fr = new FileReader();

    fr.onload = function(ev2) {
      console.dir(ev2);
      // calls the function to load image on load
      resetAll();
      img.onload = load_image;
      img.src = ev2.target.result;
    };
    fr.readAsDataURL(f);

  });

  // Show Co-ordinates check box
  $("#showCoords").change(function() {
    showCoordsCheck = this.checked;
    drawPolygons();
  });

  // Clear Polygons only
  $("#clear_pol").click(function() {
    resetAll();
    drawPolygons();
  });

  // Clear screen including Polygons and Image
  $("#clear_screen").click(function() {
    resetAll();
    c.clearRect(0,0,canvas_width,canvas_height);
    img = new Image();
    image_is_inserted=false;
    //reset input file to "file not chosen"
    $('#inputFile').val('');
  });


  // add polygon
  $("#add_polygon").click(function() {
    if (!select_nodes){
      //update for first inserted polygon
      added_polygon=true;
      edit_mode=true;
      //push previous co-ordinates only if it's not empty or if it's the first polygon
      if (coords.length!=0 || polygons.length==0){
        coords=[];
        polygons.push(coords);
        polygons_line_width.push(edge_width);
        current_polygon_index=polygons.length-1;
      }
    }
  });

  // delete polygon
  $("#delete_polygon").click(function() {
    if (!select_nodes){
      //remove polygon from polygons array
      polygons.splice(current_polygon_index, 1);

      // after removing move back to the first polygon
      if (polygons.length > 0) {
        current_polygon_index = 0;
        coords = polygons[current_polygon_index];
      }
      else{
        resetAll();
      }
      drawPolygons();
    }

  });

  // Select nodes button for removal
  $("#select_nodes").click(function() {
    select_nodes=true;
  });

  // Cancel Nodes selection button
  $("#cancel_select_nodes").on('click', function(e){
    $("#remove_node").css("visibility","hidden");
    select_nodes=false;
    clicked_nodes=[];
    drawPolygons();
  });

  // TODO: HERE
  $("#remove_node").on('click', function(e){

    let new_coords=[];
    for (let i=0; i<coords.length;i++){
      if (clicked_nodes.indexOf(i) === -1){
        new_coords.push(coords[i]);
      }
    }
    coords=new_coords;
    clicked_nodes=[];
    select_nodes=false;
    $("#remove_node").css("visibility","hidden");




    if (coords.length==0) {
      if (polygons.length > 1) {
        polygons.splice(current_polygon_index, 1);
      }
      else{
        polygons[0]=coords;
      }
      current_polygon_index = 0;
      coords = polygons[current_polygon_index];
    }
    polygons[current_polygon_index]=coords;



    drawPolygons();

  });

  $("#reset_zoom").click(function() {
    document.getElementById('my-range').value = 0;
    zoom_activated=false;
    zoomMouseDown = false;
    drawPolygons();
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
      drawPolygons();
      c.restore();
    }
    else {
      zoom_activated=false;
      zoomMouseDown = false;
      drawPolygons();
    }


  });


  //pen color option
  $("#my-pen-color").on("change", function() {
    color_pen = $(this).val();
  });

  $("#my-pen-width").on("change", function() {
    const pen_width = document.getElementById("my-pen-width");
    pen_width.setAttribute("title", this.value);
    edge_width = $(this).val();

  });

  $("#Change_color").on("click", function() {
    let new_color=color_pen;
    for (let i = 0; i < coords.length; i++) {
      coords[i][2]=new_color;
    }
    polygons[current_polygon_index]=coords;
    drawPolygons();

  });
  $("#Change_width").on("click", function() {
    polygons_line_width[current_polygon_index]=edge_width;
    drawPolygons();

  });



  // exports polygons array into JSON file
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

  // ---------------------------------------- Auxiliary functions ----------------------------------------

  // reset all flags and Polygons array
  function resetAll(){
    document.getElementById('my-range').value = 0;
    document.getElementById('my-pen-width').value = 0;
    polygons=[];
    polygons_line_width=[];
    current_polygon_index=-1;
    coords = [];
    color_pen='black';
    edge_width=2;

    added_polygon=false;
    pointCheck = false;
    clickCheck = false;
    showCoordsCheck = true;

    zoom_activated = false;
    zoomMouseDown = false;
    translatePos = {x: 0, y: 0};
    zoom_startDragOffset ={x: 0, y: 0};
    scale = 1.0;

    edit_mode=false;
    clicked_nodes=[];
    select_nodes=false;
    drag_start=[0,0];
    drag_polygon=false;
  }
  // callback function to load image into canvas in the right proportion
  function load_image(){
    image_is_inserted=true;
    let hRatio = canvas_width / img.width    ;
    let vRatio =  canvas_height / img.height  ;
    let ratio  = Math.min ( hRatio, vRatio );
    let centerShift_x = ( canvas_width - img.width*ratio ) / 2;
    let centerShift_y = ( canvas_height - img.height*ratio ) / 2;
    c.clearRect(0,0,canvas_width,canvas_height);
    c.drawImage(img, 0,0, img.width, img.height,
      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
  }
  // makes origin in bottom left
  function output(d) {
    return canvas_height-d;
  }
  // draws the dashed bounding rect around the polygon
  function drawBoundingRect() {
    let top=[0,0];
    let bottom=[0,canvas_height];
    let most_right=[0,0];
    let most_left=[canvas_width,0];
    for (let i = 0; i < coords.length; i++) {
      if (coords[i][1]>top[1]){
        top=coords[i];
      }
      if (coords[i][1]<bottom[1]){
        bottom=coords[i];
      }
      if (coords[i][0]>most_right[0]){
        most_right=coords[i];
      }
      if (coords[i][0]<most_left[0]){
        most_left=coords[i];
      }
    }
    c.save();
    c.strokeStyle='black';
    c.lineWidth=2;
    c.setLineDash([10, 5]);
    c.strokeRect(most_left[0], output(bottom[1]), most_right[0]-most_left[0], output(top[1])-output(bottom[1]));
    c.restore();
  }

  // Draw Rects around selected nodes for removal
  function drawRects() {
    drawPolygons();
    c.save();
    c.fillStyle='red';
    for (let k = 0; k < clicked_nodes.length; k++) {
      c.fillRect(coords[clicked_nodes[k]][0]-6,output(coords[clicked_nodes[k]][1])-6,12,12);
      c.stroke();
    }
    c.restore();
  }


  function checkOnEdge(clicked_coord,flag){
    for (let i = 0; i < polygons.length; i++) {
      for (let j = 0; j < polygons[i].length-1; j++) {
        if (checkOnLine(polygons[i][j],polygons[i][j+1],clicked_coord,flag)) {
            return i
        }
      }
      // check first and last coords of the polygon (private case of the above)
      if (checkOnLine(polygons[i][0],polygons[i][polygons[i].length-1],clicked_coord,flag)) {
        return i
      }
    }
    return -1
  }

  function checkOnLine(a,b,clicked_coord,flag) {
    let threshold = 25;
    let ax=a[0];
    let ay=a[1];
    let bx=b[0];
    let by=b[1];

    if (flag){
      let thresh=5;
      if (Math.min(ax,bx)==ax){
        ax=ax+thresh;
        bx=bx-thresh;
      }
      else{
        ax=ax-thresh;
        bx=bx+thresh;
      }
      if (Math.min(ay,by)==ay){
        ay=ay+thresh;
        by=by-thresh;
      }
      else{
        ay=ay-thresh;
        by=by+thresh;
      }
    }
    // Calculate the distance between the mouse click position and the line
    const A = bx-ax;
    const B = ay-clicked_coord[1];
    const C = ax - clicked_coord[0];
    const D = by - ay;
    const dist = Math.abs(A * B - C * D) / Math.sqrt(A * A + D * D);

    if (dist <= threshold &&
      (clicked_coord[0]>=Math.min(ax,bx)-threshold && clicked_coord[0]<=Math.max(ax,bx)+threshold) &&
      (clicked_coord[1]>=Math.min(ay,by)-threshold && clicked_coord[1]<=Math.max(ay,by)+threshold)){
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

  function drawPolygons() {
    c.clearRect(0,0,canvas_width,canvas_height);
    if (image_is_inserted){
      load_image();
    }
    for (let j = 0; j < polygons.length; j++) {
      c.lineWidth=polygons_line_width[j];
      for (let i = 0; i < polygons[j].length; i++) {
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
    if (edit_mode){
      drawBoundingRect();
    }

  }
});
