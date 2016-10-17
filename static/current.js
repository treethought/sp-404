
$(document).ready(function () {

var current_pad_id;


var recButton = $('#record');
var recButton = document.getElementById('record');
recButton.dataset.armed = 'false';
recButton.onclick = armRecording;




var make_pad = function (num) {       

    var pad_num = num - 0;
    var pic = document.createElement('img');
    console.log('pic created for' + pad_num);

    pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_off.png';
    pic.alt = pad_num;
    pic.className = 'Pad';
    pic.id = pad_num;
    pic.dataset.active = 'false';
    pic.dataset.recording = 'false';


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

    pic.onclick = function () {
        if (pic.dataset.active === 'true') {
            stop_pad(this);
        }
        else if (recButton.dataset.armed === 'true') {
            startRecording(this);
        }

        else {
            trigger_pad(this);
        };
    }
};

var trigger_pad = function (pic) {
    current_pad_id = pic.id;

    if (recButton.dataset.armed === 'false') {
       pic.dataset.active = 'true';
       pic.src = "{{ url_for('static', filename='images/') }}" + pic.id + '_on.png';

      $.ajax({
          url: '/trigger/'+pic.id,
          type: 'POST',
          data: pic.id,
          processData: false,
          contentType: false,
         })
         .success(function(response) {
           console.log(response)
         })
         .done(function() {
           // console.log('pad' + pic.id + 'triggered');
           console.log({{ session['active'] }});

         })
         .fail(function() {
           console.log("error");
         })
         .always(function() {
           console.log("complete");
         });

    }
    else {
        startRecording(pic);
    }


       
}

var stop_pad = function (pic) {
    console.log('pad' + pic.id + 'stopped')
    pic.dataset.active = 'false'
    current_pad_id = pic.id
    pic.src = "{{ url_for('static', filename='images/') }}" + pic.id + '_off.png';

    $.ajax({
          url: '/stop/'+pic.id,
          type: 'POST',
          data: pic.id,
          processData: false,
          contentType: false,
         })
         .done(function() {
           console.log('pad' + pic.id + 'stopped');
         })
         .fail(function() {
           console.log("error");
         })
         .always(function() {
           console.log("complete");
         });
};




// function toggleLoop() {

//   if (true) {}

//   $.ajax({
//         url: '/toggle_loop/'+ current_pad_id,
//         type: 'POST',
//         data: pic.id,
//         processData: false,
//         contentType: false,
//        })
  
// }




function armRecording() {
  if (recButton.dataset.armed === 'false') {
        recButton.style.backgroundColor = 'orange';
        console.log('Recording now armed');
        recButton.dataset.armed = 'true';
    }
  else {
      recButton.style.backgroundColor = 'gray';
      stopRecording();
      recButton.dataset.armed = 'false';
      console.log('Recording disarmed');
  }
}





function startRecording(pic) {
    var pad_num = pic.id
    console.log('Recording to pad ' + pad_num)
    $.ajax({
          url: '/record/'+ pad_num,
          type: 'POST',
          data: current_pad_id,
          processData: false,
          contentType: false,
         })
         .done(function() {
           console.log('Done');
         })
         .fail(function() {
           console.log("error");
         })
         .always(function() {
           console.log("complete");
         });
    
}

function stopRecording() {
  console.log('Recording to pad ' + current_pad_id)

    $.ajax({
          url: '/stop_recording/'+ current_pad_id,
          type: 'POST',
          data: current_pad_id,
          processData: false,
          contentType: false,
         })
         .done(function() {
           console.log('Recording for pad' + current_pad_id + 'stopped');
         })
         .fail(function() {
           console.log("error");
         })
         .always(function() {
           console.log("complete");
         });  
    }




function stopAll() {
    console.log('stopping all')
    var pads = $('.Pad');
    for (var i = 0; i < pads.length; i++) {
        if (pad.dataset.active === 'true') {
            stop_pad(pads[i]);
        }
        
    };
}







    // pic.onclick = function () {
    //      console.log('Pad '+pad_num+' clicked');
    //      // console.log("Sample source is" + sample.id);
    //      console.log('pad active is ' + pic.dataset.active);

    //      current_pad_id = pic.id;
    //      current_pad = pic;



    //      var playing = pic.dataset.active;

    //     // pad is playing, stop pad
    //      if (playing === 'true') {
    //        sample.pause();
    //        sample.currentTime = 0;
    //        pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_off.png';
    //        pic.dataset.active = 'false';
    //      } 
    //      else { // pad not playing

    //           // recording is armed -> record to pad
    //           if (armed) {
    //           console.log('Recording to ' + pic.id);
    //           pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_on.png';

    //           startRecording(pic);
    //           } 
    //           // recoridng not armed, simply play pad
    //           else {
    //           // console.log('playing pad');
    //           pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_on.png';
    //           sample.play(); 
    //           pic.dataset.active = 'true'; 
    //         }
    //      }
         
         
              

    // } 




    

    function trigger(pic) {
        console.log('pad' + pic.id + 'triggered')
     pic.src = "{{ url_for('static', filename='images/1_on.png') }}";
  
      $.ajax({
          url: '/trigger/'+pic.id,
          type: 'POST',
          data: pic.id,
          processData: false,
          contentType: false,
         })
         .done(function() {
           console.log("success");
         })
         .fail(function() {
           console.log("error");
         })
         .always(function() {
           console.log("complete");
         });

};

{% for pad in pads %}
    make_pad({{ pad.number }})
{% endfor %}


});
