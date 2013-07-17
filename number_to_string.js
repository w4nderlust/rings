numbertostring = function(number){
	number = Math.round(number)
	var number_string = ''
	if (number > 999999999999 ){
		var s = number + '';
		var integers = s.substring(0,s.length-12)
		number_string = integers + ' KB'
	} else if (number > 999999999 ){
		var s = number + '';
		var integers = s.substring(0,s.length-9)
		number_string = integers + ' B'
	} else if (number > 999999 ){
		var s = number + '';
		var integers = s.substring(0,s.length-6)
		number_string = integers + ' M'
	} else if (number > 999 ){
		var s = number + '';
		var integers = s.substring(0,s.length-3)
		number_string = integers + ' K'
	} else{
		number_string=number+'';
	}
	return number_string
}