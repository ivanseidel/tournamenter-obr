module.exports = function () {
  return function (scores) {
    var sum = 0;  
    var timeSum = 0;  
    var minScore = 9999;  
    var maxScore = 0; 
    var timeMax = 0; 
    var shouldSubtract = 0;  

    for(var k in scores) {    

      var i = k*1;    
      if (i>3) shouldSubtract = 1;    

      if (i%2 != 0) continue;   
        sum += (scores[i]*1 || 0);    

      if(minScore > scores[i]*1 && i <= 5) {    
        minScore = scores[i]*1 || 0;                    
      }       

      if(maxScore < scores[i]*1) {      
        maxScore = scores[i]*1;         
        timeMax = scores[i + 1]*1;                    
      }             

      if(scores[i + 1]) {           
        timeSum += scores[i + 1]*1;                     
      } else {      
        timeSum += 1000;    
      }      
    };        

    sum -= minScore * shouldSubtract;         
    return [sum, -timeSum, -timeMax, sum + minScore * shouldSubtract];
  }
}