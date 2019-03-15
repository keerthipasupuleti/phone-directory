window.onload = function(){

	var quickAddBtn = document.getElementById('QuickAdd');
	var quickAddFormDiv = document.querySelector('.quickaddForm')
	var cancelBtn = document.getElementById('Cancel');
	var AddBtn = document.getElementById('Add');
	
	var fullname = document.getElementById('FullName');
	var phone = document.getElementById('phoneNumber');
	var addBookDiv = document.querySelector('.addbook');

	quickAddBtn.addEventListener("click", function(){
		// display the form div
		quickAddFormDiv.style.display = "block";
	});

	cancelBtn.addEventListener("click", function(){
		quickAddFormDiv.style.display = "none";
	});

	AddBtn.addEventListener("click", addToBook);

	addBookDiv.addEventListener("click", removeEntry);

	
	var addressBook = [];

	

	function jsonStructure(FullName,phoneNumber){
		this.FullName = FullName;
		this.phoneNumber = phoneNumber;
		
	}

	function addToBook(){
		var isNull = FullName.value!='' && phoneNumber.value!='';
		if(isNull){
			// format the input into a valid JSON structure
			var obj = new jsonStructure(FullName.value,phoneNumber.value);
			addressBook.push(obj);
			localStorage['addbook'] = JSON.stringify(addressBook);
			quickAddFormDiv.style.display = "none";
			clearForm();
			showAddressBook();
		}
	}

	function removeEntry(e){
		// Remove an entry from the addressbook
		if(e.target.classList.contains('delbutton')){
			var remID = e.target.getAttribute('data-id');
			addressBook.splice(remID,1);
			localStorage['addbook'] = JSON.stringify(addressBook);
			showAddressBook();
		}
	}

	function clearForm(){
		var formFields = document.querySelectorAll('.formFields');
		for(var i in formFields){
			formFields[i].value = '';
		}
	}

	function showAddressBook(){
		if(localStorage['addbook'] === undefined){
			localStorage['addbook'] = '';
		} else {
			addressBook = JSON.parse(localStorage['addbook']);
			// Loop over the array addressBook and insert into the page
			addBookDiv.innerHTML = '';
			for(var n in addressBook){
				var str = '<div class="entry">';
					str += '<div class="name"><p>' + addressBook[n].FullName + '</p></div>';
					
					str += '<div class="phone"><p>' + addressBook[n].phoneNumber + '</p></div>';
					
					str += '<div class="del"><a href="#" class="delbutton" data-id="' + n + '">Delete</a></div>';
					str += '</div>';
				addBookDiv.innerHTML += str;
			}
		}
	}

	showAddressBook();

}