var english = /^[\sA-Za-z0-9]*$/;
var url = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
var url_printer = /^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)(?:\:(?:\d|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5]))?$/;
var usb_printer = /\/dev\/usb\/lp[0-9]/;
var space = /\s/;

var printData = {};

var isPrinterCheck = false;
var printer_param = {};
var isServiceCheck = false;
var servicesURL = "";

function printResult(){
  // console.log(printData);
  printData["printer_type"] = parseInt(document.getElementById('printer_type').value);
  printData["printer_data"] = document.getElementById('printer_data').value;
  console.log(printData);
  $.ajax({
    url: "http://localhost:3000/printImg",
    type: "POST",
    data: printData,
    timeout: 1000
  });
}

function searchData(type){
  clearResultData();
  // console.log(servicesURL);
  // console.log(document.getElementById('service_url').value);
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  // if(e.keyCode === 13){
    var input_data = document.getElementById('runnum').value;
    if(english.test(input_data)){
      if(!space.test(input_data)){
      // get data from web service
      if((input_data[2] != "n" && input_data[2] != "N") && !(/^\d+$/.test(input_data[1]))){
        var split_input = input_data.slice(0, 4) + " " + input_data.slice(4);
      }else{
        var split_input = input_data.slice(0, 3) + " " + input_data.slice(3);
        }
      }else{
        split_input = input_data;
      }
      split_input = split_input.toUpperCase();
      var params = {'event_id':event_id, 'running_no':split_input};
      console.log(params);
      $.ajax({
        url: service_url+"/select_run", //overall_rank
        // url: servicesURL+"/overall_rank",
        type: "POST",
        data: params,
      })
      .done(function (data) {
        if(data.length === 0){
          // not found data in db
          swal({
            title: "ไม่พบข้อมูล!",
            text: "กรุณาตรวจสอบข้อมูลอีกครั้ง",
            type: "error",
            confirmButtonText: "ตกลง"
          },function(){
            document.getElementById(type).value = "";
          });
          clearResultData();
        }else{
          console.log("searchData");
          console.log(data[0]);
          var running_type_id = parseInt(data[0]["running_type_id"]);
          printData["name"] = data[0]["user_name"];
          printData["running_no"] = data[0]["txt_running_no"];
          printData["running_type_id"] = running_type_id;
          checkGender(parseInt(data[0]["running_type_id"]));
          checkAgeGroup(parseInt(data[0]["running_type_id"]));
          // console.log(data);
          if(running_type_id === 1){
            getOverallCount(running_type_id, split_input);
          }else{
            getGenderCount(running_type_id, split_input);
          }
        }
      })
      .error(function(xhr,status,error) {
        console.log(xhr.status);
      });
    }
    else{
      // non english input error
      clearResultData();
      swal({
        title: "เกิดข้อผิดพลาด!",
        text: "กรุณาเปลี่ยนแป้นพิมพ์เป็นภาษาอังกฤษ",
        type: "error",
        confirmButtonText: "ตกลง"
      },function(){
        document.getElementById(type).value = "";
      });
    }
  // }
}

function checkGender(running_type_id){
  if(running_type_id === 1){
    printData["gender"] = "FUNRUN";
    printData["race"] = "5 KM";
  }else if(running_type_id > 1 && running_type_id < 9){
    printData["gender"] = "Male";
    printData["race"] = "12.7 KM";
  }else{
    printData["gender"] = "Female";
    printData["race"] = "12.7 KM";
  }
}

function checkAgeGroup(running_type_id){
  switch (running_type_id) {
    case 1:
      printData["age_group"] = "ทุกช่วงอายุ";
      break;
    case 2:
      printData["age_group"] = "น้อยกว่า19";
      break;
    case 3:
      printData["age_group"] = "20-29";
      break;
    case 4:
      printData["age_group"] = "30-39";
      break;
    case 5:
      printData["age_group"] = "40-49";
      break;
    case 6:
      printData["age_group"] = "50-59";
      break;
    case 7:
      printData["age_group"] = "60-69";
      break;
    case 8:
      printData["age_group"] = "70ขึ้นไป";
      break;
    case 9:
      printData["age_group"] = "น้อยกว่า19";
      break;
    case 10:
      printData["age_group"] = "20-29";
      break;
    case 11:
      printData["age_group"] = "30-39";
      break;
    case 12:
      printData["age_group"] = "40-49";
      break;
    case 13:
      printData["age_group"] = "50-59";
      break;
    case 14:
      printData["age_group"] = "60ขึ้นไป";
      break;
    default:
      break;
  }
}

function getOverallCount(running_type_id, split_input) {
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  if(running_type_id != 1){
    $.ajax({
      url: service_url+"/overall_count",
      type: "GET",
    })
    .done(function(data){
      printData["overall_count"] = data[0]["overall_count"];
      // console.log(data[0]);
      getOverallRank(split_input, running_type_id);
    });
  }else{
    $.ajax({
      url: service_url+"/overall_fun_count",
      type: "GET",
    })
    .done(function(data){
      console.log(data);
      printData["overall_count"] = data[0]["overall_count"];
      // console.log(data[0]);
      getOverallRank(split_input, running_type_id);
    });
  }
}

function getGenderCount(running_type_id, split_input) {
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  if(running_type_id != 1){
    $.ajax({
      url: service_url+"/gender_count",
      type: "GET",
    })
    .done(function(data){
      console.log("gender count");
      // console.log(data);
      if(running_type_id > 1 && running_type_id < 9){
        printData["gender_count"] = data[0];
      }else{
        printData["gender_count"] = data[1];
      }
      getGenderRank(split_input, running_type_id);
    });
  }
}

function getAgeCount(running_type_id, split_input) {
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  if(running_type_id != 1){
    $.ajax({
      url: service_url+"/age_count",
      type: "GET",
    })
    .done(function(data){
      console.log(running_type_id);
      console.log("age count");
      console.log(data[running_type_id-2]);
      printData["age_count"] = data[running_type_id-2]["age_count"];
      getAgeRank(split_input, running_type_id);
    });
  }
}

function getOverallRank(split_input, running_type_id){
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  var params = {'event_id':event_id, 'running_no':split_input};
  if(running_type_id != 1){
    $.ajax({
      url: service_url+"/overall_rank",
      type: "POST",
      data: params,
    })
    .done(function (data) {
      printData["chip_time"] = data["total_time"];
      // printData["gun_time"] = "01:29:22";
      printData["gun_time"] = data["gun_time"];
      printData["overall_rank"] = data["rank"];
      showResultData(running_type_id);
      // console.log(printData);
    })
    .error(function(xhr,status,error) {
      printData["overall_rank"] = 0;
    });
  }else{
    $.ajax({
      url: service_url+"/overall_fun_rank",
      type: "POST",
      data: params,
    })
    .done(function (data) {
      console.log(data);
      printData["chip_time"] = data["total_time"];
      // printData["gun_time"] = "01:29:22";
      printData["gun_time"] = data["gun_time"];
      printData["overall_rank"] = data["rank"];
      showResultData(running_type_id);
      // console.log(printData);
    })
    .error(function(xhr,status,error) {
      swal({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่พบข้อมูลผลการแข่งขัน",
        type: "error",
        confirmButtonText: "ตกลง"
      },function(){
        clearResultData();
        // document.getElementById(type).value = "";
      });
    });
  }
  // console.log(printData);
}

function getGenderRank(split_input, running_type_id){
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  var params = {'event_id':event_id, 'running_no':split_input};
  if(running_type_id != 1){
    $.ajax({
      url: service_url+"/gender_rank",
      type: "POST",
      data: params,
    })
    .done(function (data) {
      printData["gender_rank"] = data["rank"];
      getAgeCount(running_type_id, split_input);
    })
    .error(function(xhr,status,error) {
      swal({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่พบข้อมูลผลการแข่งขัน",
        type: "error",
        confirmButtonText: "ตกลง"
      },function(){
        clearResultData();
        // document.getElementById(type).value = "";
      });
      // printData["gender_rank"] = 0;
      // console.log("error");
      // getAgeCount(running_type_id, split_input);
    });
  }
}

function getAgeRank(split_input, running_type_id){
  var event_id = parseInt(document.getElementById('event_id').value);
  var service_url = document.getElementById('service_url').value;
  var params = {'event_id':event_id, 'running_no':split_input};
  if(running_type_id != 1){
    $.ajax({
      url: service_url+"/age_rank",
      type: "POST",
      data: params,
    })
    .done(function (data) {
      printData["age_rank"] = data["rank"];
      getOverallCount(running_type_id, split_input);
    })
    .error(function(xhr,status,error) {
      printData["age_rank"] = 0;
      getOverallCount(running_type_id, split_input);
    });
  }
}

function showResultData(running_type_id){
  // console.log(printData);
  // console.log(document.getElementById('gender'));
  document.getElementById('gender').innerHTML = printData["gender"];
  document.getElementById('age_group').innerHTML = printData["age_group"];
  document.getElementById('name').innerHTML = printData["name"];
  document.getElementById('running_no').innerHTML = printData["running_no"];
  document.getElementById('race').innerHTML = printData["race"];
  document.getElementById('gun_time').innerHTML = printData["gun_time"];
  document.getElementById('chip_time').innerHTML = printData["chip_time"];
  document.getElementById('overall_rank').innerHTML = printData["overall_rank"]+"/"+printData["overall_count"];
  if(running_type_id != 1){
    document.getElementById('gender_rank').innerHTML = printData["gender_rank"]+"/"+printData["gender_count"];
    document.getElementById('age_rank').innerHTML = printData["age_rank"]+"/"+printData["age_count"];
  }
  // document.getElementById('age_group').innerHTML = printData["age_group"];
}

function clearResultData() {
  printData = {};
  document.getElementById('gender').innerHTML = " ";
  document.getElementById('age_group').innerHTML = " ";
  document.getElementById('name').innerHTML = " ";
  document.getElementById('running_no').innerHTML = " ";
  document.getElementById('race').innerHTML = " ";
  document.getElementById('gun_time').innerHTML = " ";
  document.getElementById('chip_time').innerHTML = " ";
  document.getElementById('overall_rank').innerHTML = " ";
  // if(running_type_id != 1){
    document.getElementById('gender_rank').innerHTML = " ";
    document.getElementById('age_rank').innerHTML = " ";
  // }
}

function connectServer(){
  var input_data = document.getElementById('service').value;
  // console.log(input_data);
  if(url.test(input_data)){
    // console.log(input_data);
    servicesURL = input_data;
    $.ajax({
      url: servicesURL+"/select_event", //overall_rank
      // url: servicesURL+"/overall_rank",
      type: "GET",
      timeout: 1000
      // data: params,
    })
    .done(function (data) {
      // console.log(data);
      document.getElementById("service-btn").innerHTML = "Disconnect";
      document.getElementById("service-btn").className = "btn btn-danger";
      var select_event = document.getElementById('event_list');
      for(i in data){
        var opt = document.createElement('option');
        opt.value = data[i].event_id;
        opt.innerHTML = data[i].event_name;
        select_event.appendChild(opt);
      }
      isServiceCheck = true;
    })
    .error(function(xhr,status,error) {
      swal({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถเชื่อมต่อกับ Server ได้\nกรุณาตรวจสอบ URL ใหม่",
        type: "error",
        confirmButtonText: "ตกลง"
      },function(){
        document.getElementById('service').value = "";
      });
    });
  }else{
    // clearResultData();
    swal({
      title: "เกิดข้อผิดพลาด!",
      text: "กรุณาตรวจสอบ URL ใหม่",
      type: "error",
      confirmButtonText: "ตกลง"
    },function(){
      document.getElementById('service').value = "";
    });
  }
  // console.log("eiei");
}

function connectPrinter(){
  var input_data = document.getElementById('printer_interface').value;
  var printer_type = document.getElementById('printer_type').value;
  if (printer_type === '1') {
    printer_param["printer_type"] = printer_type;
    printer_param["printer_data"] = input_data;
    if(usb_printer.test(input_data)){
      $.ajax({
        url: "http://localhost:3000/checkPrinterUSB",
        type: "GET",
        data: printer_param,
        timeout: 1000
      })
      .done(function(data){
        console.log(data);
      })
      .error(function(xhr,status,error) {
        swal({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถเชื่อมต่อกับ Printer ได้\nกรุณาตรวจสอบ USB ใหม่",
          type: "error",
          confirmButtonText: "ตกลง"
        },function(){
          document.getElementById('service').value = "";
        });
      });
    }else{
      swal({
        title: "เกิดข้อผิดพลาด!",
        text: "กรุณาตรวจสอบ USB ใหม่",
        type: "error",
        confirmButtonText: "ตกลง"
      },function(){
        document.getElementById('printer_interface').value = "";
      });
    }
  }else if(printer_type === '2'){
    // is ETH printer
    if(url_printer.test(input_data) && input_data === "192.168.192.168:9100"){
      printer_param["printer_type"] = printer_type;
      printer_param["printer_data"] = input_data;
      isPrinterCheck = true;
      // $.ajax({
      //   url: "http://localhost:3000/checkPrinterEth",
      //   type: "POST",
      //   data: printer_param,
      //   timeout: 1000
      // })
      // .done(function (data) {
      //   console.log(data);
      //   isPrinterCheck = true;
      // });
    }else{
      swal({
        title: "เกิดข้อผิดพลาด!",
        text: "กรุณาตรวจสอบ URL ใหม่",
        type: "error",
        confirmButtonText: "ตกลง"
      },function(){
        document.getElementById('printer_interface').value = "";
      });
    }
  }
}

function startProgram() {
  if(isServiceCheck){
    var event_id = document.getElementById('event_list').value;
    var data_params = {};
    data_params["printer_type"] = printer_param["printer_type"];
    data_params["printer_data"] = printer_param["printer_data"];
    data_params["service_url"] = servicesURL;
    data_params["event_id"] = event_id;
    $.post( '/startProgram',data_params, function(data) {
      $('html').html(data);
    });
  }else{
    swal({
      title: "เกิดข้อผิดพลาด!",
      text: "กรุณาเชื่อมต่อ Services และ Printer",
      type: "error",
      confirmButtonText: "ตกลง"
    },function(){
      // document.getElementById('printer_interface').value = "";
    });
  }
}
