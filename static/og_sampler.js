


var current_pad_id;
var current_sample;
// var armed =  $('#record').is(':disabled');
var armed = false;


  var make_pad = function (num) {       

        var pad_num = num - 0;
        var pic = document.createElement('img');
        console.log('pic created for' + pad_num);

        //pads


        pic.src = "{{ url_for('static', filename= 'images/%s_off.png' + pad_num + '_off.png') }}" 
        // pic.src = '{% static "sampler/images/" %}' + pad_num + '_off.png';
        pic.alt = pad_num;
        pic.className = 'Pad';
        pic.id = pad_num;
        pic.dataset.active = 'false';

        //samples
        var sampleFile = "{{ url_for('static', filename='wav_files/') }}" + pad_num + '.wav';
        // var sampleFile = '{% static "sampler/samples/" %}' + pad_num + '.wav';
        var sample = document.createElement('audio');
        sample.id = 'sample' + pad_num;
        sample.src = sampleFile;
        sample.onended = function () {
           // pic.src = '{% static "sampler/images/" %}' + pad_num + '_off.png';
           pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_off.png';
           pic.dataset.active = 'false';
        }

        document.body.appendChild(sample);

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
             console.log('Pad '+pad_num+' clicked');
             console.log("Sample source is" + sample.id);
             console.log('pad active is ' + pic.dataset.active);

             current_pad_id = pic.id;
             current_pad = pic;
             current_sample = sample.src;
             console.log(current_sample);

             var playing = pic.dataset.active;

            // pad is playing, stop pad
             if (playing === 'true') {
               sample.pause();
               sample.currentTime = 0;
               pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_off.png';
               pic.dataset.active = 'false';
             } 
             else { // pad not playing

                  // recording is armed -> record to pad
                  if (armed) {
                  console.log('Recording to ' + pic.id);
                  pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_on.png';

                  startRecording(pic);
                  } 
                  // recoridng not armed, simply play pad
                  else {
                  // console.log('playing pad');
                  pic.src = "{{ url_for('static', filename='images/') }}" + pad_num + '_on.png';
                  sample.play(); 
                  pic.dataset.active = 'true'; 
                }
             }
             
             
                  

        } 

};

 for (var i = 1; i < 13; i++) {
   make_pad(i);
 };


 function play (pad) {

    while (loop) {
       // statement
     } 
 }




  var audio_context;
  var recorder;

  function armRecording (button) {
    console.log('Current pad is ' + current_pad_id)

      if (armed) {
        console.log('Current pad is ' + current_pad_id)

         stopRecording( );
         armed = false;
         button.style.backgroundColor = 'grey';
         console.log('Recording Disarmed'); 

       } else {
         armed = true;
         console.log(button.id)
         button.style.backgroundColor = 'orange';
         console.log('Recording Armed'); 
       }

  }



  function startRecording(pad) {
    recorder && recorder.record();
    console.log('Recording... to' + pad.id);
        console.log('Current pad is ' + current_pad_id)

  }

  function stopRecording() {
    recorder && recorder.stop();
    console.log('Stopped recording to' + current_pad_id);
    console.log('Current pad is ' + current_pad_id)

    console.log('Current sample is at ' + current_sample);

    // current_pad.src = '{% static "sampler/images/" %}' + current_pad_id + '_off.png'
    current_pad.src = "{{ url_for('static', filename='images/') }}" + current_pad_id + '_off.png'


    // createDownloadLink();
    updateSample(current_pad_id);
    recorder.clear();

   // //UPDATE SAMPLE
   // console.log('AFTER RECORDING, current pad is ' + current_pad_id);

   // console.log('Current sample is at ' + current_sample);

  }


  function updateSample (pad_num) {
     recorder && recorder.exportWAV(function (blob) {
        // var url = URL.createObjectURL(blob);
        sampleTarget = $('#sample'+pad_num).src;

        var url = URL.createObjectURL(blob);


        var targetSamp2 = document.querySelector('#sample'+pad_num);
        // var targetSamp2 = $('#sample'+pad_num);


        // console.log(targetSamp);
        console.log(targetSamp2);

        targetSamp2.src = url;


        var data = new FormData();
        console.log('Pad ' + pad_num + 'finished recording');

        // data.append('url', url);
        data.append('csrfmiddlewaretoken', '{{ csrf_token }}'); 
        data.append('blob', blob);
        data.append('pad_num', pad_num);

        $.ajax({
          url: 'sampler/update/',
          type: 'POST',
          data: data,
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
  });
} 


  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    console.log('Media stream created.');

    // Uncomment if you want the audio to feedback directly
    // input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');
    
    recorder = new Recorder(input);
    console.log('Recorder initialised.');
  }


  window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      
      audio_context = new AudioContext;
      console.log('Audio context set up.');
      console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }
    
    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };

