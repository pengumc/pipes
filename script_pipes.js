var PIPES_SPEED = 100;

function Field(size, classstring){
    this.x = Math.floor(size);
    var c = escape(classstring);
    if (c == "undefined") c = "normal";
    this.table = document.createElement("div");
    this.cells = new Array();
    var l = this.x * this.x;
    this.cells.length = l;
    for(var i=0;i<l;i++){
        this.cells[i] = document.createElement("div");
        this.cells[i].className = c;
        //this.cells[i].innerHTML = "&nbsp ";
        this.table.appendChild(this.cells[i]);
    }
    var inside = '';
    for(var j=0;j<this.x;j++){
        inside += '<tr>';
        for(var k=0;k<this.x;k++){
            inside += '<td class="'+ c + '"></td>';
        }
        inside += '</tr>';
    }

    //-----------------------------------------------------------
    this.getCell = function(row, col){
        if (row < this.x && col < this.x && row >= 0 && col >= 0)
           return(this.cells[row*this.x+col]);
        else
            return(undefined);
    }

    this.getAdjacentCells = function(row, col){
        a = new Array();
        a.length = 4;
        a[0] = this.getCell(row, col+1);
        a[1] = this.getCell(row-1, col);
        a[2] = this.getCell(row, col-1);
        a[3] = this.getCell(row+1, col);
        return(a);
        
    }

    this.setAttribute = function(name, text){
        var t;
        for (var i=0, c;c = this.cells[i];i++){
            t = text.replace('%i', i);
            c.setAttribute(name, t);

        }

    }

}

//-----------------------------------------------------------------
function Section(row, col){
    this.directions = [false, false, false, false];
    this.filled = false;
    this.field = new Field(3, "unavailableSection");
    this.table = this.field.table;
    this.row = row;
    this.col = col;
    this.worth = 1;
    this.special = 1;
    this.spinning = true;

    this.randomizeDirections = function(){
        var rand1 = Math.floor(Math.random() * (this.directions.length));
        var rand1 = Math.floor(Math.random() * (this.directions.length));
        var rand3 = Math.floor(Math.random() * (this.directions.length));
        var rand4 = Math.floor(Math.random() * (this.directions.length));
        this.directions[rand1] = true;
        this.directions[rand1] = true;
        this.directions[rand3] = true;
        this.directions[rand4] = true;
    }
    this.randomize = function(){
        this.randomizeDirections();
        if(gPipeField.getSpecialCount() < gPipeField.x){
            var r = Math.random();
            var chanceInc =(gPipeField.x / 1)/(gPipeField.x*gPipeField.x);
            chanceInc = chanceInc / PIPES_MAX_SPECIALS;
            if(r < chanceInc * 4 ){
                this.special = 2;
                this.spinning = false;
            }
            if(r < chanceInc *3){
                this.special = 3;
                this.spinning = false;
            }
            if(r < chanceInc * 2){
                this.special = 4;
                this.spinning = false;
            }
            if(r < chanceInc * 1){
                this.special = 5;
                this.spinning = false;
            }
        }
        this.updateState();
        return this.special;
    }

    this.updateState = function(){
        var clear = true;
        var j = 1;
        for (var i=0;i<this.directions.length;i++){
            if (this.directions[i]){
                if(this.filled)
                    this.field.cells[j].className = "filledSection";
                else
                    this.field.cells[j].className = "section";

                clear = false;
            }
            else  this.field.cells[j].className = "unavailableSection";
            j++;
            j++;
        }
        if(clear) this.field.cells[4].className = "unavailableSection";
        else if (this.filled)
            this.field.cells[4].className = "filledSection";
        else
            this.field.cells[4].className = "section";

        this.table.className = "sectionTable" + this.special;
    }

   
    this.rotate = function(){
        if (gPipeField.gameover || 
            this.filled ||
            this.spinning == false) {
           return;
        }
        var temp = this.directions[3];
        this.directions[3] = this.directions[1];
        this.directions[1] = this.directions[0];
        this.directions[0] = this.directions[2];
        this.directions[2] = temp;
        this.updateState();
        grotations++;
        updateScore();
    }

    this.fillAction = function(){
        gPipeField.addFilledSpecial(this.special);
        gpoints += this.worth;
        var s = gPipeField.x;
        switch(this.special){
            case 1:
                break;
            case 2:
                gfinalmod += 0.25;
                break;
            case 3:
                gpoints += s*s/10 - this.worth;
                break;
            case 4:
                this.special = Math.floor(Math.random() * 3 +1);
                gpoints -= this.worth;

                this.fillAction();
                break;
            case 5:
                gScoreCalc.push(function(){
                    return(s*s/20  * (parseInt(gPipeField.getFilledSpecial(3))
                    + parseInt(gPipeField.getFilledSpecial(2))));
                });

                break;
        }
    }

}

//-----------------------------------------------------------------
var score = 0;
var grotations = 0;
var gpoints = 0;
var gfinalmod = 1;
var gPipeField;
var gScoreCalc = new Array();
var PIPES_MAX_SPECIALS = 5;
function PipeField(size){
    this.x = Math.floor(size);
    var filledSpecials = new Array();
    var specialCount = new Array();
    gPipeField = this;
    this.gameover = false;
    var mainField = new Field(this.x , "pipe");
    mainField.setAttribute("onclick", "f.getSection(%i).rotate()");
    mainField.table.className = "mainTable";
    mainField.table.style.width = 49 * this.x;
    mainField.table.setAttribute('style','width:' + 49*this.x + 'px;');

    var sections = new Array();
    this.getSpecialCount = function(type){
        if(type != undefined){
            if(specialCount[type-1] == undefined)
                specialCount[type-1] = 0;
            return(specialCount[type-1]);
        }else{
            var t = 0;
            //ignore type 1 (index 0)
            for(var i=1;i<PIPES_MAX_SPECIALS;i++){
                if(specialCount[i] != undefined)
                    t += specialCount[i];
            }
            return(t);
        }
    }
    this.incSpecialCount = function(type){
        if(specialCount[type-1] != undefined)
            specialCount[type-1]++;
        else 
            specialCount[type-1] = 1;
    }
    sections.length = parseInt(mainField.cells.length);
    for (var i=0, index=0; i<this.x; i++){
        for(var j=0;j<this.x;j++){
            sections[index] = new Section(i,j);
            this.incSpecialCount(sections[index].randomize());
            mainField.cells[index].appendChild(sections[index].table);
            index++;
        }

    }
    gPipeField.sections = sections;
    var sourceIndex = Math.floor(Math.random()*(sections.length-1));
    sections[sourceIndex].filled = true;
    sections[sourceIndex].updateState();
    sections[sourceIndex].table.style.backgroundColor = "#000000";
    this.appendToBody = function(){
        //document.getElementsByTagName("body")[0].appendChild(mainField.table);
        document.body.appendChild(mainField.table.outerHTML);
    }
    this.appendToElement = function(elementid){
        document.getElementById(elementid).appendChild(
            mainField.table);
    }
    
    this.getFilledSpecial = function(special){
        if(filledSpecials[special] != undefined) return filledSpecials[special];
        else filledSpecials[special] = 0;
        return filledSpecials[special];
    }

    this.addFilledSpecial = function(special){
        if (filledSpecials[special] == undefined) {
            filledSpecials[special] = 1;
        } else {
            filledSpecials[special]++;
        }
    }



    this.getSection = function(row, col){
        if (col == undefined && row < sections.length){
            return(sections[row]);
        }
        if(!(row >= 0 && row <= this.x && col >=0 && col <= this.x)) {
            return(undefined);
        } else {
            return(sections[row*this.x+col]);
        }
    }

    this.getSectionIndex = function(row, col){
        function wrap(n, x){
            while(n < 0){
                n = x + n;
            }
            while(n >= x){
                n = n - x;
            }
            return(n);
        }
        var r = wrap(row, this.x);
        var c = wrap(col, this.x);
        return (r*this.x+c);
    }

    this.isConnectedTo = function(index1, dir1, index2, dir2){
        //document.write("connect check for " + index1 + " " + index2+"<br>");
        if( sections[index1].directions[dir1] &&
            sections[index2].directions[dir2]) return(true);
        else return(false);
    }

    this.getConnectedIndices = function(index1, filled){
        var a = new Array();
        var _filled = filled;
        if (_filled != true) _filled = false;
        var DIR_TOP = 0;
        var DIR_LEFT = 1;
        var DIR_RIGHT = 2;
        var DIR_BOTTOM = 3;
        var index = new Array();
        if(index1 >= sections.length ) return(a);
        index.length=5;
        index[0] = index1;
        var row = sections[index1].row;
        var col = sections[index1].col;
        //document.write("coords: ["+row + ", " + col + "]<br>"); 
        index[1] = this.getSectionIndex(row-1, col);
        index[2] = this.getSectionIndex(row, col-1);
        index[3] = this.getSectionIndex(row, col+1);
        index[4] = this.getSectionIndex(row+1, col);
        
        if(this.isConnectedTo(index[0], DIR_TOP, index[1], DIR_BOTTOM)){
            if(sections[index[1]].filled == _filled) 
                a.push(index[1]);
        }
        if(this.isConnectedTo(index[0], DIR_LEFT, index[2], DIR_RIGHT)){
            if(sections[index[2]].filled == _filled) 
                a.push(index[2]);
        }
        if(this.isConnectedTo(index[0], DIR_RIGHT, index[3], DIR_LEFT)){
            if(sections[index[3]].filled == _filled) 
                a.push(index[3]);
        }
        if(this.isConnectedTo(index[0], DIR_BOTTOM, index[4], DIR_TOP)){
            if(sections[index[4]].filled == _filled)
                a.push(index[4]);
        }
        return(a);
    }
    
    this.fill = 1;
    this.start = function(){
        this.fillErUp();
        this.finish();
    }

    this.finish= function(){
        if(this.fill != 0){
            setTimeout("f.finish()",400);
            return
        }
        this.gameover = true;
        updateScore(score);
        var box = document.getElementById("submitscore");
        box.style.display="inline-block";
        document.getElementById("startbutton").style.display="None";
        document.getElementById("score").style.display="None";
    }
 
    this.submit_score = function(){
        var E = document.getElementById("submitscore");
        var name = document.getElementById("submit_name").value;
        
        var req = "?a=new&size=" + this.x + "&name=" + name + "&score=" +score;
        var xml = requestXml(req); 
        if(xml == undefined){
            E.innerHTML="Submit failed...";
            return
        }
        var result = xml.getElementsByTagName("result")[0].childNodes[0].nodeValue;
        if(result == "success"){
            E.innerHTML =
             "Your score was submitted, refresh for a new game."
             + "<BR> or <a href='pipes" + Math.floor(Math.random()*40+1) + "'>"
             + "try a random sized one</a>";
            setTimeout("s.getScores()", 2000);
        }else{
            E.innerHTML = "Submitting your score failed<br>"
             + "The server reported: " + result;
        }
    }

    this.fillErUp = function(startIndex){
        var start = startIndex;
        var i,statement;
        if(startIndex == undefined) {
            start = sourceIndex;
            if (score >0) {
                this.fill--;
                return;
            }
        }
        if(sections[start].filled && start != sourceIndex) {
            //we already did this one (timeout overlap)
            this.fill--;
            return;
        }
        sections[start].filled = true;
        sections[start].fillAction();
        sections[start].updateState();
        updateScore();
        var emptySurrounding = this.getConnectedIndices(+start, false);
//        document.write(emptySurrounding.length+ "<br>");
        if (emptySurrounding.length > 0){
            for(i=0;i<emptySurrounding.length;i++){
                //this.fillErUp(emptySurrounding[i]);
                statement = "f.fillErUp(" + emptySurrounding[i] + ")";
                this.fill++;
                setTimeout(statement, PIPES_SPEED);
            }
        }
        this.fill--;
    }
}

function updateScore(){
    var temp = gpoints + calcExtra();
    score = (temp - grotations) * gfinalmod; 
    document.getElementById("score_points").innerHTML = Math.round(temp*10)/10;
    document.getElementById("score_rotations").innerHTML = grotations;
    document.getElementById("score_modifier").innerHTML = (100*gfinalmod) + "%";
    document.getElementById("score").innerHTML = parseInt(score);
    document.getElementById("submit_score").innerHTML = parseInt(score);
}

function calcExtra(){
    var total =0;
    for(var i=0, p; p=gScoreCalc[i]; i++){
        if(p != undefined)
            total += p();
    }
    return(total);
}
