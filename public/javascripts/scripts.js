$(document).ready(function(){
    loginOptions();
    displayContent();
});


function loginOptions(){
    if(localStorage.getItem("name")){
        $("#loginOptions").hide();
        $("#logoutOptions").show();
		$("#header").show();
        $("#message").html("Welcome, "+ localStorage.getItem("name"));
    } else {
        $("#loginOptions").show();
        $("#logoutOptions").hide();
		$("#header").hide();
    }
}

$('#signoutBtn').click(function(){
    localStorage.removeItem("user");
    localStorage.removeItem("name");
	localStorage.removeItem("updateId");
    loginOptions();
    displayContent();
});

function deleteThisItem(pid){
    var data = { postId:pid};
	$.post('/deletePost', data, function(resp) {
    displayContent();
    });
}

function updateThisItem(pid){
    var data = { postId:pid};
	localStorage.setItem("updateId",pid);
	$.post('/updatePost', data, function(resp) {
	if(typeof resp.error != "undefined"){
        	alert(resp.error);
        }
	else
	{
		//console.log(resp.title);
		//document.getElementById("uarticleTitle").value = resp.title;
		$("#uarticleTitle").val(resp.content);
		$("#uarticlePost").val(resp.content);
	}
    });
}



$('#registerform').submit(function(event) {
    event.preventDefault(); 
	$('#register').modal( 'hide' );
	$('#register').on('hidden.bs.modal', function () {
    $(this).find("input").val('').end();
	});
    var data = {username:$("#email").val(),password:$("#password").val(), lastname:$("#last_name").val(),firstname:$("#first_name").val()};
    $.post('/register', data, function(resp) {
        if(typeof resp.error != "undefined"){
        	alert(resp.error);
        } else {
        	//Registration Successful
			console.log("RESPO:"+resp.userId);
            localStorage.setItem("user",resp.userId);
            localStorage.setItem("name",$("#first_name").val() +" "+$("#last_name").val());
            loginOptions();
        	//alert("Success");
        }
    });
});

$('#loginform').submit(function(event) {
    event.preventDefault(); 
	$('#signin').modal( 'hide' );
	$('#signin').on('hidden.bs.modal', function () {
    $(this).find("input").val('').end();
	});
    var data = {username:$("#inputEmail").val(),password:$("#inputPassword").val()};
    $.post('/signin', data, function(resp) {
        if(typeof resp.error != "undefined"){
        	alert(resp.error);
        } else {
        	//login Successful
			localStorage.setItem("user",resp.userId);
            localStorage.setItem("name",resp.fullname);
            loginOptions();
			displayContent();
        	//alert("Success");
		}
    });
});

$('#articleform').submit(function(event) {
    event.preventDefault(); 
	$('#article').modal( 'hide' );
	$('#article').on('hidden.bs.modal', function () {
    $(this).find("input,textarea").val('').end();
	});
	var postedBy = localStorage.getItem('user');
    var data = {title:$("#articleTitle").val(),content:$("#articlePost").val(),"postedBy":postedBy};
    $.post('/blogpost', data, function(resp) {
        if(typeof resp.error != "undefined"){
        	alert(resp.error);
        } else {
        	//Post Successful
			displayContent();
			//alert("Success");
		}
    });
});

$('#uarticleform').submit(function(event) {
    event.preventDefault(); 
	$('#uArticle').modal( 'hide' );
	$('#uArticle').on('hidden.bs.modal', function () {
    $(this).find("input,textarea").val('').end();
	});
	var postedBy = localStorage.getItem('user');
	var postId = localStorage.getItem('updateId');
    var data = {title:$("#uarticleTitle").val(),content:$("#uarticlePost").val(),"postedBy":postedBy, "PostId":postId};
    $.post('/updateblog', data, function(resp) {
        if(typeof resp.error != "undefined"){
        	alert(resp.error);
        } else {
        	//update Successful
			displayContent();
			//alert("Success");
		}
    });
});

function displayContent(){
	var panelHtml = '';
	$.get("/allPosts", function(data) {
		console.log(data);
		
			if(data.allPosts.length == 0){
            	panelHtml += '<div class="panel panel-default">';
  				panelHtml += '<div class="panel-heading"><h3 class="panel-title">No Posts Available</h3></div>';
  				panelHtml += '<div class="panel-body">Use the button on navigation to enter some items</div>';
  				panelHtml += '</div>';
  				$("#blogPosts").html(panelHtml);

  			} else {
  				for(var i = 0;i<data.allPosts.length;i++){
  					panelHtml += '<div class="panel panel-default">';
  					panelHtml += '<div class="panel-heading clearfix">';
					if(localStorage.getItem('user') == data.allPosts[i].uId)
					{
						panelHtml += '<div class="btn-group pull-right"><a href="#" onclick="deleteThisItem(\''+data.allPosts[i].pId+'\')" class="btn btn-danger btn-sm">x</a></div>';
						panelHtml += '<div class="btn-group pull-right" data-toggle="modal" data-target="#uArticle"><a href="#" onclick="updateThisItem(\''+data.allPosts[i].pId+'\')" class="btn btn-info btn-sm"><span class="glyphicon glyphicon-pencil"></span></a></div>';
					}
					panelHtml +='<h3 class="panel-title">'+data.allPosts[i].title+'<small>by '+data.allPosts[i].username+' at '+data.allPosts[i].timePosted+'</small></h3> </div>';
  					panelHtml += '<div class="panel-body">'+data.allPosts[i].content+'</div>';
  					panelHtml += '</div>';
  					$("#blogPosts").html(panelHtml);
  				}
  			}

		});
}
	
