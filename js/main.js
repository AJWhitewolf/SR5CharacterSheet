/**
 * Created by adunigan on 10/29/2015.
 */
var bitsDoc;
var pcDoc;
var xser = new XMLSerializer();
var xslDoc;

$(document).ready(function() {

    $.ajax({
        type: 'GET',
        url: '/fetchCharacters',
        dataType: 'text',
        success: function(response){
            var json = JSON.parse(response);
            for(i=0;i<json.cList.length;i++){
                //var li = "<li>"+json.cList[i]+"</li>";
                var li = document.createElement("li");
                li.innerText = json.cList[i];
                li.setAttribute("onclick", "getCharacter('"+json.cList[i]+"')");
                $('#characters_menu').append(li);
            }

            var sli = document.createElement("li");
            sli.appendChild(document.createTextNode("-"));
            $('#characters_menu').append(sli);

            var newli = document.createElement("li");
            newli.setAttribute("onclick", "openDialog('newCharacter')");
            newli.appendChild(document.createTextNode("New Character"));
            $('#characters_menu').append(newli);

            $("#charmenuheader").menu({
                position: {my: "top", at: "bottom"}
            });
        }
    });

    $.ajax({
        type: "GET",
        url: "xml/templates/bits.xml",
        dataType: "xml",
        success: function(xml) {
            bitsDoc = xml;
        }
    });

    $.ajax({
        type: "GET",
        url: "xml/templates/main.xsl",
        dataType: "xml",
        success: function (xsl) {
            xslDoc = xsl;
        }
    });

});


function newCharacter(charName) {
    sendTo("/new", "charName="+charName, function(response){
        if(response['response'] == "failure") {
            $("#dialogBox").dialog({
                modal: true,
                title: "Error"
            });
        } else {
            $("#dialogBox").dialog("close");
            getCharacter(charName);
        }
    });
}

function sendTo(url, data, callback){
    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        data: data,
        success: function (res){
            callback(res);
        }
    });
}
var currentCharacter;
function getCharacter(charName) {
    charName = charName.split(" ").join("");
    $.ajax({
        type: "GET",
        url: "xml/characters/"+charName+".xml",
        dataType: "xml",
        success: function(xml) {
            var xmlDoc = xml;

            pcDoc = xmlDoc;
            displayResult(xmlDoc, xslDoc);

            $(".sliderDiv").accordion({collapsible: true, header: "h3"});
            var h3s = document.getElementsByTagName("h3");
            for(i=0;i<h3s.length;i++){
                document.getElementsByTagName("h3")[i].innerText = capitalizeFirstLetter(document.getElementsByTagName("h3")[i].innerText);
                document.getElementsByTagName("h3")[i].innerText = document.getElementsByTagName("h3")[i].innerText.split("_").join(" ");
            }
            var attNods = document.getElementById("attributes").getElementsByTagName("ul")[0].getElementsByTagName("li");
            for(var i=0;i<attNods.length;i++){
                attNods[i].getElementsByTagName("span")[0].innerHTML = capitalizeFirstLetter(attNods[i].getElementsByTagName("span")[0].innerHTML);
            }
            var gearNodes = document.getElementById("gear").getElementsByTagName("ul")[0].getElementsByTagName("h4");
            for(var i=0;i<gearNodes.length;i++){
                gearNodes[i].innerHTML = capitalizeFirstLetter(gearNodes[i].innerHTML);
                gearNodes[i].innerHTML = gearNodes[i].innerHTML.split("_").join(" ");
            }
            var statNodes = document.getElementById("stats").getElementsByTagName("ul")[0].getElementsByTagName("li");
            for(var i=0;i<statNodes.length;i++) {
                var bits = statNodes[i].getElementsByTagName("span")[0].innerHTML.split("_");
                for(var k=0;k<bits.length;k++){
                    bits[k] = capitalizeFirstLetter(bits[k]);
                }
                var txt = bits.join(" ");
                statNodes[i].getElementsByTagName("span")[0].innerHTML = txt;
            }

            currentCharacter = charName;

            //Character sheet is loaded and formatted
            //Spawn and attach all event listeners
            $('.editable').on('blur', function() {
                switchEdit(this);
            });
            $('.editable').on('keypress', function(e){
                if(e.keyCode == 10 || e.keyCode == 13){
                    e.preventDefault();
                    $(this).blur();
                }
            });
            $('.editable').on("focus", function() {
                $(this).selectText();
            });
            $("#active_skills li[title]").each(function(index, value){
                    var tbits = $(this).attr("title").split("|");
                    var newTitle = tbits[0] + " (" + tbits[1] + ") + " + capitalizeFirstLetter(tbits[2]) + " (" + $(pcDoc).find('attributes').find(tbits[2]).text() + ")";
                    $(this).attr("title", newTitle);
            });
            $(".basicField").each(function(index, value){
                var cval = $(this).text();
                $(this).text(capitalizeFirstLetter(cval));
            });
        }
    });
}

function getBit(parentName){
    return bitsDoc.getElementsByTagName("root")[0].getElementsByTagName(parentName)[0].childNodes[0].cloneNode(true);
}


var g_dialog_pos;
var g_dialog_doc;

function removeNode(pos, docNode){
    g_dialog_pos = pos;
    g_dialog_doc = docNode;
    openDialog("removeNode");
}

function getNodeByPos(pos) {
    var idbits = pos.split(".");
    var cNode = pcDoc.getElementsByTagName("character")[0];
    for(var i=0;i<idbits.length;i++){
        if(isNaN(idbits[i])){
            cNode = cNode.getElementsByTagName(idbits[i])[0];
        } else {
            cNode = cNode.childNodes[idbits[i]-1];
        }
    }
    return cNode;
}

function htmlEntities(str) {
    return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function switchEdit(elem) {
    var newValue = elem.innerText;
    newValue = newValue.replace(/"/g, '|');
    newValue = encodeURIComponent(newValue);

    //newValue = htmlEntities(newValue);

    var cNode = getNodeByPos(elem.id);
    if(cNode.hasChildNodes()) {
        if (cNode.childNodes[0].nodeValue == newValue) {
            return false;
        }
        cNode.childNodes[0].nodeValue = newValue;
    } else {
        cNode.appendChild(document.createTextNode(newValue));
    }
    var jdata = {
        update: {
            character: pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue,
            newValue: newValue,
            node: elem.id
        }
    }
    sendTo("/update", 'payload=' + JSON.stringify(jdata), function (response) {
        console.log(response);
    });
}

function displayResult(xml, xsl) {
    xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    var resultDoc = xsltProcessor.transformToFragment(xml, document);
    document.getElementById("mainContentContainer").innerHTML = "";
    $("#mainContentContainer").append(resultDoc);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createNewSkill() {
    var sName = $("#dialog_name").val();
    var sRating = $("#dialog_rating").val();
    var sAttribute = $("#dialog_attribute").val();

    var bit = bitsDoc.getElementsByTagName("root")[0].getElementsByTagName("active_skills")[0].getElementsByTagName("skill")[0].cloneNode(true);
    bit.getElementsByTagName("name")[0].appendChild(document.createTextNode(sName));
    bit.getElementsByTagName("rating")[0].appendChild(document.createTextNode(sRating));
    bit.getElementsByTagName("attribute")[0].appendChild(document.createTextNode(sAttribute));

    var ser = new XMLSerializer();

    if(document.getElementById("dialogBoxContent").getElementsByTagName("ul").length > 0) {
        var specList = document.getElementById("dialogBoxContent").getElementsByTagName("ul")[0].getElementsByTagName("input");
        for (var i = 0; i < specList.length; i++) {
            //var spec = document.createElement("specialization");
            var spec;
            if(i == 0) {
                spec = bit.getElementsByTagName("specialization")[0];
            } else {
                spec = bitsDoc.getElementsByTagName("active_skills")[0].getElementsByTagName("skill")[0].getElementsByTagName("specialization")[0].cloneNode(true);
                bit.appendChild(spec);
            }
            //console.log(ser.serializeToString(spec));
            spec.appendChild(document.createTextNode(specList[i].value));
            //console.log(ser.serializeToString(spec))
        }
    } else {
        var spec = bit.getElementsByTagName("specialization")[0];
        spec.parentNode.removeChild(spec);
    }
    //$(pcDoc).find('active_skills').append($(bit, $(pcDoc).find('active_skills')));
    pcDoc.getElementsByTagName("active_skills")[0].appendChild(bit);


    var data = {
        update: {
            character: pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue,
            position: "active_skills",
            node: ser.serializeToString(bit)
        }
    };
    sendTo("/addNode", "payload="+JSON.stringify(data), function(response){
        if(response['response'] == "success"){
            getCharacter(pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue);
            $("#dialogBox").dialog("close");
        }

    });
}

function createNewSkillGroup() {
    var sName = $("#dialog_name").val();
    var sRating = $("#dialog_rating").val();
    var sName1 = $("#dialog_skill1_name").val();
    var sName2 = $("#dialog_skill2_name").val();
    var sName3 = $("#dialog_skill3_name").val();
    var sAttr1 = $("#dialog_skill1_attribute").val();
    var sAttr2 = $("#dialog_skill2_attribute").val();
    var sAttr3 = $("#dialog_skill3_attribute").val();

    var bit = bitsDoc.getElementsByTagName("root")[0].getElementsByTagName("active_skills")[0].getElementsByTagName("skill_group")[0].cloneNode(true);
    bit.getElementsByTagName("name")[0].appendChild(document.createTextNode(sName));
    bit.getElementsByTagName("rating")[0].appendChild(document.createTextNode(sRating));

    bit.getElementsByTagName("skill")[0].getElementsByTagName("name")[0].appendChild(document.createTextNode(sName1));
    bit.getElementsByTagName("skill")[0].getElementsByTagName("attribute")[0].appendChild(document.createTextNode(sAttr1));

    bit.getElementsByTagName("skill")[1].getElementsByTagName("name")[0].appendChild(document.createTextNode(sName2));
    bit.getElementsByTagName("skill")[1].getElementsByTagName("attribute")[0].appendChild(document.createTextNode(sAttr2));

    bit.getElementsByTagName("skill")[2].getElementsByTagName("name")[0].appendChild(document.createTextNode(sName3));
    bit.getElementsByTagName("skill")[2].getElementsByTagName("attribute")[0].appendChild(document.createTextNode(sAttr3));


    pcDoc.getElementsByTagName("active_skills")[0].appendChild(bit);
    var ser = new XMLSerializer();
    var data = {
        update: {
            character: pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue,
            position: "active_skills",
            node: ser.serializeToString(bit)
        }
    };
    sendTo("/addNode", "payload="+JSON.stringify(data), function(response){
        if(response['response'] == "success"){
            getCharacter(pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue);
            $("#dialogBox").dialog("close");
        }

    });
}

function addKnowledgeSkill() {
    var kname = $("#dialog_name").val();
    var krating = $("#dialog_rating").val();

    var bit = bitsDoc.getElementsByTagName("knowledge_skills")[0].getElementsByTagName("skill")[0].cloneNode(true);

    bit.getElementsByTagName("name")[0].appendChild(document.createTextNode(kname));
    bit.getElementsByTagName("rating")[0].appendChild(document.createTextNode(krating));

    $(pcDoc).find('knowledge_skills').append(bit);

    var ser = new XMLSerializer();

    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "knowledge_skills",
            node: ser.serializeToString(bit)
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addLanguage() {
    var lname = $("#dialog_name").val();
    var lrating = $("#dialog_rating").val();

    var bit = $(bitsDoc).find('languages').find('language').clone();

    $(bit).find('name').text(lname);
    $(bit).find('rating').text(lrating);
    $(pcDoc).find('languages').append(bit);

    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "languages",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addContact() {
    var cname = $("#dialog_name").val();
    var cloyalty = $("#dialog_loyalty").val();
    var cconnection = $("#dialog_connection").val();
    var cinfo = $("#dialog_info").val();

    var bit = $(bitsDoc).find('contacts').find('contact').clone();

    $(bit).find('name').text(cname);
    $(bit).find('loyalty').text(cloyalty);
    $(bit).find('connection').text(cconnection);
    $(bit).find('info').text(cinfo);
    $(pcDoc).find('languages').append(bit);

    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "contacts",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addSpell() {
    var bit = $(bitsDoc).find('spells').find('spell').clone();
    $("#dialogBoxContent input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if($(this).val() != "") {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $(pcDoc).find('spells').append(bit);
    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "spells",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addPower() {
    var bit = $(bitsDoc).find('powers').find('power').clone();
    $("#dialogBoxContent input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if($(this).val() != "") {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $(pcDoc).find('powers').append(bit);
    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "powers",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}



function addCyberLimb() {
    var bit = $(bitsDoc).find('cyberware').find('limb').clone();
    $(bit).find('name').text($("#dialog_name").val());
    $(bit).find('essence').text( $("#dialog_essence").val() );
    $(bit).find('capacity').text( $("#dialog_capacity").val() );

    $(bit).find('attributes').find('strength').text( $("#dialog_strength").val() );
    $(bit).find('attributes').find('agility').text( $("#dialog_agility").val() );
    if( $("#dialog_armor").val() ) {
        $(bit).find('attributes').find('armor').text( $("#dialog_armor").val() );
    }

    $("#dialogBoxContent ul li").each(function(index, value) {
        var mbit;
        if(index > 0) {
            mbit = $(bitsDoc).find('cyberware').find('limb').find('mod').clone();
            $(bit).find('mods').append(mbit);
        } else {
            mbit = $(bit).find('mods').find('mod');
        }
        mbit.find('name').text( $(this).find("input[id='mod_name']").val() );
        if( $(this).find("input[id='mod_rating']").val() ) {
            mbit.find('rating').text( $(this).find("input[id='mod_rating']").val() );
        } else {
            mbit.find('rating').remove();
        }
        mbit.find('capacity').text( $(this).find("input[id='mod_capacity']").val() );
        mbit.find('info').text( $(this).find("input[id='mod_info']").val() );
    });
    $(pcDoc).find('cyberware').append(bit);

    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "cyberware",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}
function addCyberItem() {
    var bit = $(bitsDoc).find('cyberware').find('item').clone();
    $("#dialogBoxContent input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if($(this).val() != "") {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $(pcDoc).find('cyberware').append(bit);
    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "cyberware",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addBioware() {
    var bit = $(bitsDoc).find('bioware').find('item').clone();
    $("#dialogBoxContent input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if( $(this).val() ) {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $(pcDoc).find('bioware').append(bit);
    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "bioware",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addArmor() {
    var bit = $(bitsDoc).find('gear').find('armor').find('item').clone();
    $(bit).find('name').text($("#dialog_name").val());
    $(bit).find('armor').text( $("#dialog_armor").val() );

    $("#dialogBoxContent ul li").each(function(index, value) {
        var mbit;
        if(index > 0) {
            mbit = $(bitsDoc).find('gear').find('armor').find('item').find('mods').find('mod').clone();
            $(bit).find('mods').append(mbit);
        } else {
            mbit = $(bit).find('mods').find('mod');
        }
        mbit.find('name').text( $(this).find("input[id='mod_name']").val() );
        if( $(this).find("input[id='mod_rating']").val() ) {
            mbit.find('rating').text( $(this).find("input[id='mod_rating']").val() );
        } else {
            mbit.find('rating').remove();
        }
        mbit.find('info').text( $(this).find("input[id='mod_info']").val() );
    });
    $(pcDoc).find('gear').find('armor').append(bit);

    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "gear.armor",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addMeleeWeapon(){
    var bit = $(bitsDoc).find('gear').find('melee_weapons').find('item').clone();
    $("#dialogBoxContent input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if( $(this).val() ) {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $(pcDoc).find('gear').find('melee_weapons').append(bit);
    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "gear.melee_weapons",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addRangedWeapon() {
    var bit = $(bitsDoc).find('gear').find('ranged_weapons').find('item').clone();
    $("#dialogBoxContent>input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if( $(this).val() ) {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $("#dialogBoxContent ul li").each(function(index, value) {
        var mbit;
        if(index > 0) {
            mbit = $(bitsDoc).find('gear').find('ranged_weapons').find('item').find('mods').find('mod').clone();
            $(bit).find('mods').append(mbit);
        } else {
            mbit = $(bit).find('mods').find('mod');
        }
        mbit.find('name').text( $(this).find("input[id='mod_name']").val() );
        if( $(this).find("input[id='mod_rating']").val() ) {
            mbit.find('rating').text( $(this).find("input[id='mod_rating']").val() );
        } else {
            mbit.find('rating').remove();
        }
        mbit.find('info').text( $(this).find("input[id='mod_info']").val() );
    });
    $(pcDoc).find('gear').find('ranged_weapons').append(bit);

    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "gear.ranged_weapons",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function addMisc(){
    var bit = $(bitsDoc).find('gear').find('misc').find('item').clone();
    $("#dialogBoxContent input").each(function(index, value){
        var nid = $(this).attr('id').split("_", 2)[1];
        if( $(this).val() ) {
            bit.find(nid).text($(this).val());
        } else {
            bit.find(nid).remove();
        }
    });
    $(pcDoc).find('gear').find('misc').append(bit);
    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "gear.misc",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

function removeCat(parentName){
    g_dialog_pos = parentName;
    openDialog("removeCat");
}

function addNote() {
    var bit = $(bitsDoc).find('notes').find('note').clone();
    $(bit).find('content').text( $("#dialog_content").val() );

    var ser = new XMLSerializer();
    var jdata = {
        update: {
            character: $(pcDoc).find('basic_info').find('name').text(),
            position: "notes",
            node: ser.serializeToString(bit[0])
        }
    }
    sendTo("/addNode", "payload="+JSON.stringify(jdata), function(response){
        if(response['response'] == "success"){
            getCharacter($(pcDoc).find('basic_info').find('name').text());
            $("#dialogBox").dialog("close");
        }
    });
}

jQuery.fn.selectText = function(){
    var doc = document
        , element = this[0]
        , range, selection
        ;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};