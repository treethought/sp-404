// $(document).ready(function () {
  poll();
    
  var imageDir = $('#imageDir').data('dir');
  var status = $('#appStatus').data('stats');


  var current_pad_id;

  var recButton = $('#record');
  // var recButton = document.getElementById('record');
  recButton.data('armed', false);
  recButton.click(toggleRecord);

  for (var i = 1; i < 13; i++) {
    makePad(i);
  };

  function makePad(pad_num) {

    var pic = document.createElement('img');

      pic.dataset.onFile = imageDir + pad_num + '_on.png';
      pic.dataset.offFile = imageDir + pad_num + '_off.png';
      pic.src = pic.dataset.offFile;
      pic.alt = pad_num;
      pic.className = 'Pad';
      pic.id = pad_num;

      // pic.dataset.active = function () {
      //     return (pic.src === onFile)
      // };

      pic.dataset.active = false;
      pic.dataset.recording = false;
      pic.onclick = function () {
          current_pad_id = pic.id;
          triggerPad(pic.id);
      }

      if (pad_num < 4) {
        var row1 = $('#1.row');
        row1.append(pic)
        };
            
      if (pad_num >= 4 && pad_num < 7) {
        var row1 = $('#2.row');
        row1.append(pic);
        };    

      if (pad_num >= 7 && pad_num < 10) {
          var row1 = $('#3.row');
          row1.append(pic) 
        };

      if (pad_num >= 10 && pad_num < 13) {
          var row1 = $('#4.row');
          row1.append(pic); 
        };

  }

function toggleRecord() {

  if (recButton.data('armed')) {
        $.ajax({
          url: '/stop_recording',
          type: 'GET',
          data: status,
          processData: false,
          contentType: false,
         }) 
          .success(function(response) {
            console.log(response)  
          })

      recButton.data('armed', false);
      recButton.css('background-color', 'silver');
      console.log('Recording Disarmed');
    }
    else {
      recButton.data('armed', true)
      recButton.css('background-color', 'red');
      console.log('Recording Armed');
    }
}

function triggerPad(padId) {
    var pad = $('#'+padId);
    current_pad_id = padId;

    if (recButton.data('armed')) {
      $.ajax({
          url: '/record/'+padId,
          type: 'POST',
          data: status,
          processData: false,
          contentType: false,
         }) 
          .success(function(response) {
            console.log(response);
            console.log('Recording to pad'+padId)
          })
          return


    }

    else if (pad.data()['active']) {
        pad.attr('src', pad.data('offFile'))
        pad.data('active', false);
    }
    else {
        pad.attr('src', pad.data('onFile'))
        pad.data('active', true);
    }


    $.ajax({
          url: '/trigger/'+padId,
          type: 'POST',
          data: status,
          processData: false,
          contentType: false,
         }) 
          .success(function(response) {
            console.log(response)  
          })

}




function poll() {
    setTimeout(function() {
        $.ajax({
            url: "/status",
            type: "GET",
            success: function(data) {
                // console.log(data);
                sync(data);
            },
            dataType: "json",
            complete: poll,
            timeout: 200
        })
    }, 20)};


function sync(data) {
  let status = data;

  for (pad_num of status['playing']) {
    activePad = $('#'+pad_num)
    activePad.attr('src', activePad.data('onFile'));

  }

  for (pad_num of status['not_playing']) {
    activePad = $('#'+pad_num)
    activePad.attr('src', activePad.data('offFile'));

  }
}



// })







