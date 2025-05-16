var app = angular.module('app.scorers', [])
  
  
.factory('RescueScorer2025Regional', function (){
  var model = {
    gaps: {

    },
    squares: {
      'initial': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    tentativa: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    seesaw: {

    },
    becos: {

    },
    rampas: {

    },

    bonus_de_saida: {
      'final': 0,
    },

    rescue_kit: { 
      'delivered': 0,
    },

    desafio_surpresa: { 
      'completed': 0,
    },

    victims: {
      'total': 3,
      'fails': 0,
    },

    victims_alive: {
      'total': 0,
    },
    victims_dead: {
      'total': 0,
    },
    victims_switched: {
      'total': 0,
    },
    multiplier: { 
      'value': 1,
    }
  };

  var scorings ={
    gaps: [0,10],
    tentativa: 0,

    obstacles: [0,20],
    speedbump: [0, 10],
    intersection: [0,10],
    passage: [0, 0],

    becos: [0, 10],
    rampas: [0, 10],
    seesaw: [0, 20],

    squares: function(sub, val, scorings, model){
      const squarePoints = [0, 5, 3, 1]
      if(sub === 'initial' ){
        return squarePoints[val];
      }
      else{
        const points = squarePoints[model.tentativa[sub]] * val
        return points;
      }
    },

    rescue_kit: function(){
      return 0;
    },

    desafio_surpresa: function(){
      return 0;
    },

    bonus_de_saida: function(sub, val, scorings, model) {
      const total_lackOfProgress = Object.keys(model.tentativa).map((index) => {
        const tentativa = parseInt(model.tentativa[index], 10)
        const reduceOne = model.squares[index] < 1 && tentativa === 3 ? 0 : 1;
        const falha = tentativa === 0 ? 0 : tentativa -reduceOne;
        return falha;
      }).reduce((prev, curr) => (prev + curr), 0)
      const bonus = (60 - 5*total_lackOfProgress) * val;
      return bonus > 0 ? bonus : 0;
    },

    multiplier: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      return 0;
    },

    victims_dead: function(sub, val, scorings, model) {
      return 0;
    },
    victims_switched: function(sub, val, scorings, model) {
      return 0;
    },
  }

  return {
    view: 'views/rescue_scorer_2025_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      var victim_save_multiplier = 1.3;
      var switched_save_multiplier = 1.1; 
      var desafio_surpresa_multipliers = [1, 1.5];

      var correct_victims_multiplier = Math.pow(victim_save_multiplier, (model.victims_alive.total + model.victims_dead.total));
      var switched_victms_multiplier = Math.pow(switched_save_multiplier, model.victims_switched.total)

      const desafioSurpresaMultiplier = desafio_surpresa_multipliers[model.desafio_surpresa.completed]

      var multiplier = correct_victims_multiplier * switched_victms_multiplier * desafioSurpresaMultiplier;
      if(multiplier < 1){
        multiplier = 1;
      }

      model.multiplier.value = (Math.round(multiplier*1000)/1000);
      scored.total = Math.round(scored.total * multiplier);``
      return scored;
    }
  }
})

  
.factory('RescueScorer2024Nacional', function (){
  var model = {
    gaps: {

    },
    squares: {
      'initial': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    tentativa: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    seesaw: {

    },
    becos: {

    },
    rampas: {

    },

    bonus_de_saida: {
      'final': 0,
    },

    rescue_kit: { 
      'delivered': 0,
    },

    desafio_surpresa: { 
      'completed': 0,
    },

    victims: {
      'total': 3,
      'fails': 0,
    },

    victims_alive: {
      'total': 0,
    },

    victims_dead: {
      'total': 0,
    },
    multiplier: { 
      'value': 1,
    }
  };

  var scorings ={
    gaps: [0,10],
    tentativa: 0,

    obstacles: [0,20],
    speedbump: [0, 10],
    intersection: [0,10],
    passage: [0, 0],

    becos: [0, 10],
    rampas: [0, 10],
    seesaw: [0, 20],

    squares: function(sub, val, scorings, model){
      const squarePoints = [0, 5, 3, 1]
      if(sub === 'initial' ){
        return squarePoints[val];
      }
      else{
        const points = squarePoints[model.tentativa[sub]] * val
        return points;
      }
    },

    rescue_kit: function(){
      return 0;
    },

    desafio_surpresa: function(){
      return 0;
    },

     bonus_de_saida: function(sub, val, scorings, model) {
      const total_lackOfProgress = Object.keys(model.tentativa).map((index) => {
        const tentativa = parseInt(model.tentativa[index], 10)
        const reduceOne = model.squares[index] < 1 && tentativa === 3 ? 0 : 1;
        const falha = tentativa === 0 ? 0 : tentativa - reduceOne;
        return falha;
      }).reduce((prev, curr) => (prev + curr), 0)
      const bonus = (60 - 5*total_lackOfProgress) * val;
      return bonus > 0 ? bonus : 0;
    },

    multiplier: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      return 0;
    },

    victims_dead: function(sub, val, scorings, model) {
      return 0;
    },
  }

  return {
    view: 'views/rescue_scorer_2024_nacional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 480,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      var victim_save_multiplier = 1.3; // for easy mode or N1
      var victms_lost_points = 0.05;
      var rescue_kit_multipliers = [1, 1, 1];
      var desafio_surpresa_multipliers = [1, 1.5];

      var alive_victcms_multiplier = Math.pow((victim_save_multiplier - model.victims.fails * victms_lost_points), model.victims_alive.total);
      if(alive_victcms_multiplier < 1){
        alive_victcms_multiplier = 1;
      }
      if(model.victims_alive.total === 2 && model.victims_dead.total === 1){
        var dead_victms_multiplier = (victim_save_multiplier -  model.victims.fails * victms_lost_points);
        if(dead_victms_multiplier < 1){
          dead_victms_multiplier = 1;
        }
        alive_victcms_multiplier = alive_victcms_multiplier * dead_victms_multiplier;
      }
      const rescueKitMultiplier = rescue_kit_multipliers[model.rescue_kit.delivered]
      const desafioSurpresaMultiplier = desafio_surpresa_multipliers[model.desafio_surpresa.completed]

      var multiplier = alive_victcms_multiplier * rescueKitMultiplier * desafioSurpresaMultiplier;
      if(multiplier < 1){
        multiplier = 1;
      }

      model.multiplier.value = (Math.round(multiplier*1000)/1000);
      scored.total = Math.round(scored.total * multiplier);``
      return scored;
    }
  }
})  

.factory('RescueScorer2024Regional', function (){
  var model = {
    gaps: {

    },
    squares: {
      'initial': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    tentativa: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    seesaw: {

    },
    becos: {

    },
    rampas: {

    },

    bonus_de_saida: {
      'final': 0,
    },

    rescue_kit: { 
      'delivered': 0,
    },

    desafio_surpresa: { 
      'completed': 0,
    },

    victims: {
      'total': 3,
      'fails': 0,
    },

    victims_alive: {
      'total': 0,
    },
    victims_dead: {
      'total': 0,
    },
    victims_switched: {
      'total': 0,
    },
    multiplier: { 
      'value': 1,
    }
  };

  var scorings ={
    gaps: [0,10],
    tentativa: 0,

    obstacles: [0,20],
    speedbump: [0, 10],
    intersection: [0,10],
    passage: [0, 0],

    becos: [0, 10],
    rampas: [0, 10],
    seesaw: [0, 20],

    squares: function(sub, val, scorings, model){
      const squarePoints = [0, 5, 3, 1]
      if(sub === 'initial' ){
        return squarePoints[val];
      }
      else{
        const points = squarePoints[model.tentativa[sub]] * val
        return points;
      }
    },

    rescue_kit: function(){
      return 0;
    },

    desafio_surpresa: function(){
      return 0;
    },

    bonus_de_saida: function(sub, val, scorings, model) {
      const total_lackOfProgress = Object.keys(model.tentativa).map((index) => {
        const tentativa = parseInt(model.tentativa[index], 10)
        const reduceOne = model.squares[index] < 1 && tentativa === 3 ? 0 : 1;
        const falha = tentativa === 0 ? 0 : tentativa -reduceOne;
        return falha;
      }).reduce((prev, curr) => (prev + curr), 0)
      const bonus = (60 - 5*total_lackOfProgress) * val;
      return bonus > 0 ? bonus : 0;
    },

    multiplier: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      return 0;
    },

    victims_dead: function(sub, val, scorings, model) {
      return 0;
    },
    victims_switched: function(sub, val, scorings, model) {
      return 0;
    },
  }

  return {
    view: 'views/rescue_scorer_2024_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      var victim_save_multiplier = 1.3;
      var switched_save_multiplier = 1.1; 
      var desafio_surpresa_multipliers = [1, 1.5];

      var correct_victims_multiplier = Math.pow(victim_save_multiplier, (model.victims_alive.total + model.victims_dead.total));
      var switched_victms_multiplier = Math.pow(switched_save_multiplier, model.victims_switched.total)

      const desafioSurpresaMultiplier = desafio_surpresa_multipliers[model.desafio_surpresa.completed]

      var multiplier = correct_victims_multiplier * switched_victms_multiplier * desafioSurpresaMultiplier;
      if(multiplier < 1){
        multiplier = 1;
      }

      model.multiplier.value = (Math.round(multiplier*1000)/1000);
      scored.total = Math.round(scored.total * multiplier);``
      return scored;
    }
  }
})

.factory('RescueScorer2023Nacional', function (){
  var model = {
    gaps: {

    },
    squares: {
      'initial': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    tentativa: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    seesaw: {

    },
    becos: {

    },
    rampas: {

    },

    bonus_de_saida: {
      'final': 0,
    },

    rescue_kit: { 
      'delivered': 0,
    },

    desafio_surpresa: { 
      'completed': 0,
    },

    victims: {
      'total': 3,
      'fails': 0,
    },

    victims_alive: {
      'total': 0,
    },

    victims_dead: {
      'total': 0,
    },
    multiplier: { 
      'value': 1,
    }
  };

  var scorings ={
    gaps: [0,10],
    tentativa: 0,

    obstacles: [0,15],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 10],

    becos: [0, 10],
    rampas: [0, 10],
    seesaw: [0, 15],

    squares: function(sub, val, scorings, model){
      const squarePoints = [0, 5, 3, 1]
      if(sub === 'initial' ){
        return squarePoints[val];
      }
      else{
        const points = squarePoints[model.tentativa[sub]] * val
        return points;
      }
    },

    rescue_kit: function(){
      return 0;
    },

    desafio_surpresa: function(){
      return 0;
    },

    bonus_de_saida: function(sub, val, scorings, model) {
      const total_lackOfProgress = Object.keys(model.tentativa).map((index) => {
        const tentativa = parseInt(model.tentativa[index], 10)
        const falha = tentativa === 0 ? 0 : tentativa -1;
        return falha;
      }).reduce((prev, curr) => (prev + curr), 0)
      const bonus = (60 - 5*total_lackOfProgress) * val;
      return bonus > 0 ? bonus : 0;
    },

    multiplier: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      return 0;
    },

    victims_dead: function(sub, val, scorings, model) {
      return 0;
    },
  }

  return {
    view: 'views/rescue_scorer_2023_nacional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 480,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      var victim_save_multiplier = 1.3; // for easy mode or N1
      var victms_lost_points = 0.05;
      var rescue_kit_multipliers = [1, 1.1, 1.4];
      var desafio_surpresa_multipliers = [1, 1.1];

      var alive_victcms_multiplier = Math.pow((victim_save_multiplier - model.victims.fails * victms_lost_points), model.victims_alive.total);
      if(alive_victcms_multiplier < 1){
        alive_victcms_multiplier = 1;
      }
      if(model.victims_alive.total === 2 && model.victims_dead.total === 1){
        var dead_victms_multiplier = (victim_save_multiplier -  model.victims.fails * victms_lost_points);
        if(dead_victms_multiplier < 1){
          dead_victms_multiplier = 1;
        }
        alive_victcms_multiplier = alive_victcms_multiplier * dead_victms_multiplier;
      }
      const rescueKitMultiplier = rescue_kit_multipliers[model.rescue_kit.delivered]
      const desafioSurpresaMultiplier = desafio_surpresa_multipliers[model.desafio_surpresa.completed]

      var multiplier = alive_victcms_multiplier * rescueKitMultiplier * desafioSurpresaMultiplier;
      if(multiplier < 1){
        multiplier = 1;
      }

      model.multiplier.value = (Math.round(multiplier*1000)/1000);
      scored.total = Math.round(scored.total * multiplier);``
      return scored;
    }
  }
})
  
.factory('RescueScorer2023Regional', function (){
  var model = {
    gaps: {

    },
    squares1: {
      'initial': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares2: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares3: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    fails: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    seesaw: {

    },
    becos: {

    },
    rampas: {

    },
    mode: {
      'final': 1,
    },
    rescue_kit: { 
      'delivered': 0,
    },

    victims: {
      'total': 5,
      'fails': 0,
    },

    victims_alive: {
      'total': 0,
    },

    victims_dead: {
      'total': 0,
    },
    victims_switched: {
      'total': 0,
    },
    multiplier: { 
      'value': 1,
    }
  };

  var scorings ={
    gaps: [0,10],

    squares1: 5,
    squares2: 3,
    squares3: 1,
    fails: 0,

    obstacles: [0,15],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 10],

    becos: [0, 10],
    rampas: [0, 10],
    seesaw: [0, 15],

    rescue_kit: function(){
      return 0;
    },

    multiplier: function(val, scorings, model) {
      return 0
    },

    mode: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      return 0;
    },

    victims_dead: function(sub, val, scorings, model) {
      return 0;
    },
    victims_switched: function(sub, val, scorings, model) {
      return 0;
    },
  }

  return {
    view: 'views/rescue_scorer_2023_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };

      Object.keys(model.squares2).map(key => {
        if(model.squares1[key] > 0){
          model.squares2[key] = 0;
        }
      })

      Object.keys(model.squares3).map(key => {
        if(model.squares1[key] > 0 || model.squares2[key] > 0){
          model.squares3[key] = 0;
        }
      })
      
      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      var victim_save_multiplier = 1.3;
      var switched_save_multiplier = 1.1; 
      var rescue_kit_multipliers = [1, 1.1, 1.2, 1.3, 1.6];

      var correct_victims_multiplier = Math.pow(victim_save_multiplier, (model.victims_alive.total + model.victims_dead.total));
      var switched_victms_multiplier = Math.pow(switched_save_multiplier, model.victims_switched.total)
      const rescueKitMultiplier = rescue_kit_multipliers[model.rescue_kit.delivered] 

      var multiplier = correct_victims_multiplier * switched_victms_multiplier * rescueKitMultiplier;
      if(multiplier < 1){
        multiplier = 1;
      }

      model.multiplier.value = (Math.round(multiplier*1000)/1000);
      scored.total = Math.round(scored.total * multiplier);``
      return scored;
    }
  }
})

.factory('RescueScorer2022Nacional', function (){

  var model = {
    gaps: {

    },
    squares1: {
      'initial': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    squares2: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    squares3: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    fails: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    seesaw: {

    },
    becos: {

    },
    rampas: {

    },

    bonus_de_saida: {
      'final': 0,
    },

    mode: {
      'final': 1,
    },
    rescue_kit: { 
      'delivered': 0,
    },

    victims: {
      'total': 3,
      'fails': 0,
    },

    victims_alive: {
      'total': 0,
    },

    victims_dead: {
      'total': 0,
    },
    multiplier: { 
      'value': 1,
    }
  };

  var scorings ={
    gaps: [0,10],

    squares1: 5,
    squares2: 3,
    squares3: 1,
    fails: 0,

    obstacles: [0,15],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 0],

    becos: [0, 10],
    rampas: [0, 5],
    seesaw: [0, 15],

    rescue_kit: function(){
      return 0;
    },

    bonus_de_saida: function(sub, val, scorings, model) {
      const total_lackOfProgress = Object.keys(model.fails).map((index) => parseInt(model.fails[index], 10)).reduce((prev, curr) => (prev + curr), 0)
      const bonus = (60 - 5*total_lackOfProgress) * val;
      return bonus > 0 ? bonus : 0;
    },

    multiplier: function(val, scorings, model) {
      return 0
    },

    mode: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      return 0;
    },

    victims_dead: function(sub, val, scorings, model) {
      return 0;
    },
  }

  return {
    view: 'views/rescue_scorer_2022_nacional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 480,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      var victim_save_multiplier = 1.2; // for easy mode or N1
      var victms_lost_points = 0.025;
      var rescue_kit_multipliers = [1, 1.1, 1.3];

      if(model.mode.final === 2){ //hard mode
        victim_save_multiplier = 1.4;
        victms_lost_points = 0.05;
        rescue_kit_multipliers = [1, 1.2, 1.6];
      }

      var alive_victcms_multiplier = Math.pow((victim_save_multiplier - model.victims.fails * victms_lost_points), model.victims_alive.total);
      if(model.victims_alive.total === 2 && model.victims_dead.total === 1){
        alive_victcms_multiplier = alive_victcms_multiplier * (victim_save_multiplier -  model.victims.fails * victms_lost_points);
      }
      const rescueKitMultiplier = rescue_kit_multipliers[model.rescue_kit.delivered] - model.victims.fails * victms_lost_points

      var multiplier = alive_victcms_multiplier * rescueKitMultiplier;
      if(multiplier < 1){
        multiplier = 1;
      }

      model.multiplier.value = (Math.round(multiplier*1000)/1000);
      scored.total = Math.round(scored.total * multiplier);``
      return scored;
    }
  }
})

.factory('RescueScorer2022Regional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    obstacles: {

    },
    seesaw: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    beco: {

    },

    saiu_salvamento: {
      'final': 0,
    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    },
    challenge: {
      'first': 0
    },
    victims_dead: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    },
    rescueKit: 0
  };

  var scorings = {
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    obstacles: [0,15],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 10],
    beco: [0, 10],
    seesaw: [0, 15],
    challenge: [0, 60],
    saiu_salvamento: [0, 20],

    victims: [0, 60, 40, 20],
    victims_dead: [0, 50, 30, 10],
    rescueKit: [0, 0, 0]
  }

  var rescueKitMultipliers = [1, 1.1, 1.2]

  return {
    view: 'views/rescue_scorer_2022_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };
      var totalVictmsSaved = 0;
      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          }else{
            points = scorings[k][mission];
          }

          scored[k][i] = points;
          scored.total += points || 0;
          if((k === "victims" || k === "victims_dead") && points > 0){
              totalVictmsSaved += 1;
          }
        }
      }
      var multiplier = Math.pow(rescueKitMultipliers[model.rescueKit], totalVictmsSaved)
      scored.total = Math.round(scored.total * multiplier)
      return scored;
    }
  }
})

.factory('RescueScorer2019Regional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    beco: {

    },

    saiu_salvamento: {
      'final': 0,
    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
      'desafio': 0,
    },
    victims_dead: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    }
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,15],
    passage: [0, 10],
    beco: [0, 15],

    saiu_salvamento: [0, 20],

    victims: [0, 60, 40, 20],
    victims_dead: [0, 50, 30, 10],
  }

  return {
    view: 'views/rescue_scorer_2019_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          }else{
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})

.factory('RescueScorer2018Nacional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    squares1: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares2: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares3: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    becos: {

    },
    rampas: {

    },

    saiu_salvamento: {
      'final': 0,
    },

    altura: {
      'final': 0,
    },

    victims: {
      'total': 1,
      'attempts': 1,
    },

    victims_alive: {
      'total': 0,
    },

    victims_dead: {
      'before_alive': 0,
      'after_alive': 0,
    },

    // victims_lower_live: {
    //   '1a': 0,
    // },

    // victims_upper_dead: {
    //   '1a': 0,
    // },

    // victims_upper_live: {
    //   '1a': 0,
    // },
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    squares1: 5,
    squares2: 3,
    squares3: 1,

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,15],
    passage: [0, 10],

    becos: [0, 15],
    rampas: [0, 5],

    saiu_salvamento: [0, 20],

    altura: function(val, scorings, model) {
      return 0
    },

    victims: function(sub, val, scorings, model) {
      return 0
    },

    victims_alive: function(sub, val, scorings, model) {
      var salvou_todas_vivas = model.victims.total <= model.victims_alive.total
      var tentativa = model.victims.attempts - 1
      var nivel_alto = model.altura.final
      var pontos_base = nivel_alto ? 40 : 30
      var pontos = val * Math.max(pontos_base - (5 * tentativa), 0)
      // if (salvou_todas_vivas) {
      //   return val * 
      // }
      return pontos
    },

    victims_dead: function(sub, val, scorings, model) {
      var salvou_todas_vivas = model.victims.total <= model.victims_alive.total
      var tentativa = model.victims.attempts - 1
      var nivel_alto = model.altura.final
      var pontos_base = nivel_alto ? 30 : 20

      if (sub == 'before_alive') {
        pontos_base = 5
      }

      var pontos = val * Math.max(pontos_base - (5 * tentativa), 0)
      return pontos
    },

    // victims: [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400],

    // victims_lower_dead: [0, 15, 30, 45,  60,  75,  90, 105, 120],
    // victims_lower_live: [0, 30, 60, 90, 120, 150, 180, 210, 240],

    // victims_upper_dead: [0, 20, 40,  60,  80, 100, 120, 140, 160],
    // victims_upper_live: [0, 40, 80, 120, 160, 200, 240, 280, 320],
  }

  return {
    view: 'views/rescue_scorer_2018_nacional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 480,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if (typeof pointsGroup == 'function') {
            points = pointsGroup(i, mission, scorings, model)
          } else if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          } else {
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})

.factory('RescueScorer2018Regional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    beco: {

    },

    saiu_salvamento: {
      'final': 0,
    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
      'desafio': 0,
    },
    victims_dead: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    }
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 10],
    beco: [0, 10],

    saiu_salvamento: [0, 20],

    victims: [0, 60, 40, 20],
    victims_dead: [0, 50, 30, 10],
  }

  return {
    view: 'views/rescue_scorer_2018_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          }else{
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})

.factory('RescueScorer2017Nacional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    squares1: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares2: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares3: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },
    becos: {

    },

    saiu_salvamento: {
      'final': 0,
    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    },

    victims_lower_dead: {
      '1a': 0,
    },

    victims_lower_live: {
      '1a': 0,
    },

    victims_upper_dead: {
      '1a': 0,
    },

    victims_upper_live: {
      '1a': 0,
    },
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    squares1: 3,
    squares2: 2,
    squares3: 1,

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,15],
    passage: [0, 0],

    becos: [0, 15],

    saiu_salvamento: [0, 20],

    victims: [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400],

    victims_lower_dead: [0, 15, 30, 45,  60,  75,  90, 105, 120],
    victims_lower_live: [0, 30, 60, 90, 120, 150, 180, 210, 240],

    victims_upper_dead: [0, 20, 40,  60,  80, 100, 120, 140, 160],
    victims_upper_live: [0, 40, 80, 120, 160, 200, 240, 280, 320],
  }

  return {
    view: 'views/rescue_scorer_2017_nacional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 480,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          }else{
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})


.factory('RescueScorer2017Regional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
      'desafio': 0,
    },
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 10],

    victims: [0, 60, 40, 20],
  }

  return {
    view: 'views/rescue_scorer_2017_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    totalTime: 300,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          }else{
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})

// =========================================
// =========== Versões antigas =============
// =========================================

.factory('RescueAScorer', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
      'last': 0,
    },
    corridors: {
      'ramp': 0,
      'hallway': 0,
    },
    gaps: {

    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    victim: {
      raise: 0,
      touch: 0,
    }
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,10],

    victim: [0, 20],
  }

  return {
    view: 'views/rescue_scorer_2014.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var points = scorings[k][mission];

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }

})

.factory('RescueScorer2015Regional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    },
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,10],
    passage: [0, 10],

    victims: [0, 60, 40, 20, 0],
  }

  return {
    view: 'views/rescue_scorer_2016_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var points = scorings[k][mission];

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})


.factory('RescueScorer2016Regional', function (){

  var model = {
    rooms: {
      'first': 0,
      'secc': 0,
    },
    corridors: {
      'ramp': 0,
    },
    gaps: {

    },
    squares1: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares2: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    squares3: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
    },
    obstacles: {

    },
    speedbump: {

    },
    intersection: {

    },
    passage: {

    },

    victims: {
      '1a': 0,
      '2a': 0,
      '3a': 0,
    },
  };

  var scorings ={
    rooms: [0, 60, 40, 20, 0],
    corridors: [0,30,20,10,0],
    gaps: [0,10],

    squares1: 3,
    squares2: 2,
    squares3: 1,

    obstacles: [0,10],
    speedbump: [0, 5],
    intersection: [0,15],
    passage: [0, 10],

    victims: [0, 40, 80, 120, 160, 200, 240, 280, 320, 360, 400],
  }

  return {
    view: 'views/rescue_scorer_2016_regional.html?r='+Math.random(),
    model: model,
    scorings: scorings,
    score: function (model){
      var scored = {
        total: 0,
      };

      for(var k in model){
        scored[k] = {};
        var group = model[k];

        for(var i in group){
          var mission = group[i];
          if(mission === false) mission = 0;
          if(mission === true) mission = 1;

          var pointsGroup = scorings[k];
          var points;
          if(typeof pointsGroup == 'number'){
            points = pointsGroup * mission;
          }else{
            points = scorings[k][mission];
          }

          scored[k][i] = points
          scored.total += points || 0;
        }
      }

      return scored;
    }
  }
})

.factory('FLLWorldClassScorer', function (){

  var model = {
    door:0,
    cloud:0,
    collective:0,
    insert:0,
    insertLoop:0,
    sense:0,
    outbox:0,
    remote:0,
    search:0,
    searchLoops:0,
    sports:0,
    reverseBasker:0,
    reverseReplicate:0,
    adapt:0,
    learnBound:0,
    learnTouch:0,
    projects:0,
    engage:0,
    gyros: 0,
    penalties:0,
  };

  var scorings ={
    door: [0,15],
    cloud: [0,30],
    collective: [0,25],
    insert: [0,25],
    // insertLoop: special, if insert, then [0,30]
    sense: [0,40],
    outbox: [0,25,40],
    remote: [0,40],
    search: [0,15],
    // searchLoops: special, if search, then [0,45]
    sports: [0,30,60],
    reverseBasker: [0,30],
    // reverseReplicate: special, if reverseBasker, [0,15]
    adapt: [0,15],
    learnBound: [0,20],
    // learnTouch: special, if learnBound, [0,15],
    projects: [0,20,30,40,50,60,70,80,90],
    penalties: [0,-10,-20,-30,-40,-50,-60,-70,-80],
    // engage: [0,20],
    // gyros: special, if engage, then crazy calculus
  }

  return {
    view: 'views/fll_scorer_world_class.html',
    model: model,
    scorings: scorings,
    score: function (model){
      var scored = {
        total: 0,
      };
      // Usual scoring, based on a table data
      for(var mission in model){
        // console.log(mission);
        if(!scorings[mission]) continue;
        var score = model[mission];
        if(score === false) score = 0;
        if(score === true) score = 1;

        var points = scorings[mission][score];
        scored[mission] = points
        scored.total += points || 0;
      }

      // Special cases
      scored.insertLoop = [0,30][model.insertLoop * model.insert];
      scored.total += scored.insertLoop;

      scored.searchLoops = [0,45][model.searchLoops * model.search];
      scored.total += scored.searchLoops;

      scored.reverseReplicate = [0,15][model.reverseReplicate * model.reverseBasker];
      scored.total += scored.reverseReplicate;

      scored.learnTouch = [0,15][model.learnTouch * model.learnBound];
      scored.total += scored.learnTouch;

      scored.engage = [0,20][model.engage];
      scored.gyros = 0;
      if(model.engage){
        var percentage = (model.gyros ? model.gyros*1 + 9 : 0) / 100.0;
        percentage = Math.min(percentage, 0.58);
        scored.gyros = scored.total * percentage;
      }
      scored.total += scored.engage
      scored.total += scored.gyros;

      // Limit to zero the minimum score
      scored.total = Math.max(0, Math.round(scored.total));

      // Invalidate score
      if(scored.searchLoops && model.projects > 6)
        scored.total = null;

      return scored;
    }
  }
})