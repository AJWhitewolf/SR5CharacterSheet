/**
 * Created by adunigan on 11/1/2015.
 */
function openDialog(which){
    switch(which){
        case "newQuality":
            var html = "<ul>";
            html += "<li>Name: <input id='dialog_name' /></li>"+
                    "<li>Type: <select id='dialog_type'><option value='positive'>Positive</option><option value='negative'>Negative</option></select>"+
                    "<li>Karma Cost/Gain: <input type='number' id='dialog_karma' /></li>"+
                    "<li>Info: <textarea id='dialog_info'></textarea></li>";
            html += "</ul>";
            document.getElementById("dialogBoxContent").innerHTML = html;
            $("#dialogBox").dialog({
                title: "Add a New Quality",
                buttons: [
                    {
                        text: "Save",
                        click: function() {
                            var bit = $(bitsDoc).find("qualities").find("quality").clone();
                            $(bit).children().each(function(index, value){
                                $(this).text( $("#dialog_"+$(this).prop("tagName")).val() );
                            });

                            var ser = new XMLSerializer();
                            var data =
                            {
                                update:

                                {
                                        character: pcDoc.getElementsByTagName("character")[0].getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue,
                                        position: "qualities",
                                        node: ser.serializeToString(bit[0])
                                }
                            };
                            sendTo("http://localhost:9555/addNode", "payload="+JSON.stringify(data), function(response){
                                if(response['response'] == "success") {
                                    $("#dialogBox").dialog("close");
                                    getCharacter(pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue);
                                } else {
                                    alert("Failed to Add item, please reload.");
                                }
                            });
                        }
                    }
                ]
            });
            break;

        case "newActiveSkill":
            var html = "Create New: <span class='dialog_button' onclick='populateDialog(\"skillGroup\")'>Skill Group</span>";
            html += "<span class='dialog_button' onclick='populateDialog(\"skill\")'>Skill</span>";
            document.getElementById("dialogBoxContent").innerHTML = html;
            $("#dialogBox").dialog({
                title: "New Active Skill/Group"
            });
            break;

        case "newCharacter":
            document.getElementById("dialogBoxContent").innerHTML = "Character Name: <input id='dialog_charName' />";
            $("#dialogBox").dialog({
                title: "New Character",
                buttons: [
                    {
                        text: "Create",
                        click: function() {
                            newCharacter($("#dialog_charName").val());
                            $(this).dialog("close");
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }
                ]
            });
            break;

        case "newKnowledgeSkill":
            var html = "Skill Name: <input id='dialog_name' />" +
                    "<br />Rating: <input id='dialog_rating' type='number' max=6 min=1 step=1 />";
            document.getElementById("dialogBoxContent").innerHTML = html;
            $("#dialogBox").dialog({
                title: "Add New Knowledge Skill",
                buttons: [
                    {
                        text: "Add",
                        click: function() {
                            addKnowledgeSkill();
                        }
                    }
                ]

            });
            break;

        case "newLanguage":
            var html = "Language Name: <input id='dialog_name' />" +
                    "<br />Rating: <input id='dialog_rating' type='number' max=4 min=1 step=1 />";
            document.getElementById("dialogBoxContent").innerHTML = html;
            $("#dialogBox").dialog({
                title: "Add New Language",
                buttons: [
                    {
                        text: "Add",
                        click: function() {
                            addLanguage();
                        }
                    }
                ]
            });
            break;

        case "newContact":
            var html = "Contact Name: <input id='dialog_name' />"+
                    "<br />Loyalty: <input id='dialog_loyalty' type='number' min=1 max=3 step=1 />"+
                    "<br />Connection: <input id='dialog_connection' type='number' min=1 max=3 step=1 />"+
                    "<br />Info: <textarea id='dialog_info'></textarea>";
            $("#dialogBoxContent").html(html);
            $("#dialogBox").dialog({
                title: "Add New Contact",
                buttons: [
                    {
                        text: "Add",
                        click: function() {
                            addContact();
                        }
                    }
                ]
            });
            break;

        case "newspells":
            var html = "Spell Name: <input id='dialog_name' />"+
                    "<br />Direct/Indirect: <input id='dialog_direct_or_indirect' />"+
                    "<br />Type: <input id='dialog_type' />"+
                    "<br />Duration: <input id='dialog_duration' />"+
                    "<br />Range: <input id='dialog_range' />"+
                    "<br />Drain: <input id='dialog_drain' />"+
                    "<br />Damage: <input id='dialog_damage' />"+
                    "<br />Info: <textarea id='dialog_info' />";
            $("#dialogBoxContent").html(html);
            $("#dialogBox").dialog({
                title: "Add New Spell",
                buttons: [
                    {
                        text: "Add",
                        click: function() {
                            addSpell();
                        }
                    }
                ]
            });
            break;

        case "newpowers":
            var html = "Power Name: <input id='dialog_name' />"+
                    "<br/>Rating: <input type='number' id='dialog_rating' />"+
                    "<br/>Cost (PP): <input type='number' id='dialog_pp' />"+
                    "<br/>Drain: <input id='dialog_drain' />"+
                    "<br/>Info: <input id='dialog_info' />";
            $("#dialogBoxContent").html(html);
            $("#dialogBox").dialog({
                title: "Add New Adept Power",
                buttons: [
                    {
                        text: "Add",
                        click: function() {
                            addPower();
                        }
                    }
                ]
            });
            break;

        case "newcyberware":
            var html = "<span class='dialog_button' onclick='newCyberLimb()'>Cyber Limb</span> <span class='dialog_button' onclick='newCyberItem()'>Cyberware</span>";
            $("#dialogBoxContent").html(html);
            $("#dialogBox").dialog({
                title: "Add Cyberware"
            });
            break;

        case "newbioware":
            var html = "Name: <input id='dialog_name' />"+
                    "<br/>Rating: <input type='number' id='dialog_rating' />"+
                    "<br/>Essence: <input type='number' id='dialog_essence' />"+
                    "<br/>Info: <textarea id='dialog_info'></textarea>";
            $("#dialogBoxContent").html(html);
            $("#dialogBox").dialog({
                title: "Add New Bioware",
                buttons: [
                    {
                        text: "Add",
                        click: function() {
                            addBioware();
                        }
                    }
                ]
            });
            break;

        case "newgear":
            var html = "<span class='dialog_button' onclick='newArmor()'>Armor</span>" +
                " <span class='dialog_button' onclick='newMeleeWeapon()'>Melee Weapon</span> " +
                "<span class='dialog_button' onclick='newRangedWeapon()'>Ranged Weapon</span>"+
                "<span class='dialog_button' onclick='newMisc()'>Misc</span>";
            $("#dialogBoxContent").html(html);
            $("#dialogBox").dialog({
                title: "Add Gear"
            });
            break;

        case "newNote":
            $("#dialogBoxContent").html("Add a new Note: <textarea id='dialog_content'></textarea>");
            $("#dialogBox").dialog({
                title: "Add Note",
                buttons: [
                    {
                        text: "Save",
                        click: function(){
                            addNote();
                        }
                    }
                ]
            });
            break;

        case "removeNode":
            document.getElementById("dialogBoxContent").innerHTML = "Are you sure you want to remove this item?";
            var docNode = g_dialog_doc;
            var pos = g_dialog_pos;

            var jdata = {
                remove: {
                    character: pcDoc.getElementsByTagName("basic_info")[0].getElementsByTagName("name")[0].childNodes[0].nodeValue,
                    position: pos
                }
            }
            $("#dialogBox").dialog({
                title: "Remove Item",
                modal: "true",
                buttons: [
                    {
                        text: "Delete Item",
                        click: function() {
                            sendTo("http://localhost:9555/removeNode", "payload="+JSON.stringify(jdata), function(response){
                                if(response['response'] == "success") {
                                    var cNode = getNodeByPos(pos);
                                    cNode.parentNode.removeChild(cNode);
                                    var linode = docNode.parentNode;
                                    linode.parentNode.removeChild(linode);
                                    $("#dialogBox").dialog("close");
                                }
                            });
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            $("#dialogBox").dialog("close");
                        }
                    }
                ]
            });
            break;

        case "removeCat":
            var html = "Are you sure you want to remove this category?";
            $("#dialogBoxContent").html(html);
            var pos = g_dialog_pos;

            $("#dialogBox").dialog({
                title: "Remove Category",
                modal: "true",
                buttons: [
                    {
                        text: "Delete Category",
                        click: function() {
                            var rdata = {
                                remove: {
                                    character: $(pcDoc).find('basic_info').find('name').text(),
                                    position: pos
                                }
                            }
                            sendTo("http://localhost:9555/removeNode", 'payload='+JSON.stringify(rdata), function(response){
                                if(response['response'] == "success"){
                                    $("#"+pos).remove();
                                    $(pcDoc).find(pos).remove();
                                    getCharacter($(pcDoc).find('basic_info').find('name').text());
                                    $("#dialogBox").dialog("close");
                                }
                            });
                        }
                    }
                ]

            });
            break;
    }
}

function addSkillSpecDialog() {
    if(document.getElementById("dialogBoxContent").getElementsByTagName("ul").length < 1) {
        var ul = document.createElement("ul");
        document.getElementById("dialogBoxContent").appendChild(ul);
    }
    var input = "<li><input class='skillSpec' /></li>";
    $("#dialogBoxContent ul").append(input);
}

var attsList = "<option value='body'>Body</option>"+
        "<option value='agility'>Agility</option>"+
        "<option value='reaction'>Reaction</option>"+
        "<option value='strength'>Strength</option>"+
        "<option value='willpower'>Willpower</option>"+
        "<option value='logic'>Logic</option>"+
        "<option value='intuition'>Intuition</option>"+
        "<option value='charisma'>Charisma</option>"+
        "<option value='magic'>Magic</option>"+
        "<option value='resonance'>Resonance</option>";

function populateDialog(which){
    var html = "";
    switch(which){
        case "skill":
            html += "Name: <input id='dialog_name' />" +
                "<br />Rating: <input id='dialog_rating' type='number' min=1 max=7 />" +
                "<br />Linked Attribute: <select id='dialog_attribute'>" + attsList + "</select>"+
                "<br />Specializations: <span class='dialog_button' onclick='addSkillSpecDialog()'>+</span>";
            document.getElementById("dialogBoxContent").innerHTML = html;
            $("#dialogBox").dialog({
                buttons: [
                    {
                        text: "Save",
                        click: function() {
                            createNewSkill();

                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            $("#dialogBox").dialog("close");
                        }
                    }
                ]
            });
            break;

        case "skillGroup":
            html += "Name: <input id='dialog_name' />" +
                "<br />Rating: <input id='dialog_rating' type='number' min=1 max=6 />" +
                "<br />Skill 1: <input id='dialog_skill1_name' />" +
                "<br /> > Linked Attribute: <select id='dialog_skill1_attribute'>" + attsList + "</select>" +
                "<br />Skill 1: <input id='dialog_skill2_name' />" +
                "<br /> > Linked Attribute: <select id='dialog_skill2_attribute'>" + attsList + "</select>" +
                "<br />Skill 1: <input id='dialog_skill3_name' />" +
                "<br /> > Linked Attribute: <select id='dialog_skill3_attribute'>" + attsList + "</select>";
            document.getElementById("dialogBoxContent").innerHTML = html;
            $("#dialogBox").dialog({
                buttons: [
                    {
                        text: "Save",
                        click: function() {
                            createNewSkillGroup();
                            $("#dialogBox").dialog("close");
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            $("#dialogBox").dialog("close");
                        }
                    }
                ]
            });
            break;
    }
}

function newCyberLimb() {
    var html = "Limb: <input id='dialog_name' />"+
        "<br/>Essence: <input id='dialog_essence' type='number' />"+
        "<br/>Capacity: <input id='dialog_capacity' type='number' />"+
        "<hr />"+
        "<h4>Limb Attributes</h4>"+
        "Strength: <input id='dialog_strength' type='number' value=3 />"+
        "<br/>Agility: <input id='dialog_agility' type='number' value=3 />"+
        "<br/>Armor: <input id='dialog_armor' type='number' />"+
        "<hr />"+
        "<h4>Mods</h4>"+
        "<span class='dialog_button' onclick='addLimbMod()'>Add Mod</span>"+
        "<br/>"+
        "<ul></ul>";
    $("#dialogBoxContent").html(html);

    $("#dialogBox").dialog({
        buttons: [
            {
                text: "Done",
                click: function() {
                    addCyberLimb();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $("#dialogBox").dialog("close");
                }
            }
        ]
    });
}

function newCyberItem() {
    var html = "Name: <input id='dialog_name' />"+
            "<br/>Rating: <input id='dialog_rating' type='number' />"+
            "<br/>Essence: <input id='dialog_essence' type='number' />"+
            "<br/>Info: <textarea id='dialog_info'></textarea>";
    $("#dialogBoxContent").html(html);
    $("#dialogBox").dialog({
        buttons: [
            {
                text: "Done",
                click: function() {
                    addCyberItem();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $("#dialogBox").dialog("close");
                }
            }
        ]
    });
}

function newArmor() {
    var html = "Name: <input id='dialog_name' />"+
            "<br/>Armor: <input id='dialog_armor' type='number' />"+
            "<hr/>"+
            "<h4>Mods</h4>"+
            "<span class='dialog_button' onclick='addArmorMod()'>Add Mod</span>"+
            "<br/>"+
            "<ul></ul>";
    $("#dialogBoxContent").html(html);
    $("#dialogBox").dialog({
        buttons: [
            {
                text: "Done",
                click: function() {
                    addArmor();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $("#dialogBox").dialog("close");
                }
            }
        ]
    });
}
function newMeleeWeapon() {
    var html = "Name: <input id='dialog_name' />"+
        "<br/>Damage: <input id='dialog_damage' />"+
        "<br/>Accuracy: <input id='dialog_accuracy' type='number' />"+
        "<br/>Reach: <input id='dialog_reach' type='number' />"+
        "<br/>Skill: <input id='dialog_skill' />"+
        "<br/>Specialization: <input id='dialog_specialization' />";
    $("#dialogBoxContent").html(html);
    $("#dialogBox").dialog({
        buttons: [
            {
                text: "Done",
                click: function() {
                    addMeleeWeapon();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $("#dialogBox").dialog("close");
                }
            }
        ]
    });
}
function newRangedWeapon() {
    var html = "Name: <input id='dialog_name' />"+
        "<br/>Damage: <input id='dialog_damage' />"+
        "<br/>Accuracy: <input id='dialog_accuracy' type='number' />"+
        "<br/>AP: <input id='dialog_ap' type='number' />"+
        "<br/>Ammo: <input id='dialog_ammo' />"+
        "<br/>Skill: <input id='dialog_skill' />"+
        "<br/>Specialization: <input id='dialog_specialization' />"+
        "<hr/>"+
        "<h4>Mods</h4>"+
        "<span class='dialog_button' onclick='addRangedWeaponMod()'>Add Mod</span>"+
        "<br/>"+
        "<ul></ul>";
    $("#dialogBoxContent").html(html);
    $("#dialogBox").dialog({
        buttons: [
            {
                text: "Done",
                click: function() {
                    addRangedWeapon();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $("#dialogBox").dialog("close");
                }
            }
        ]
    });
}
function newMisc() {
    var html = "Name: <input id='dialog_name' />"+
        "<br/>Rating: <input id='dialog_rating' type='number' />"+
        "<br/>Info: <textarea id='dialog_info'></textarea>";
    $("#dialogBoxContent").html(html);
    $("#dialogBox").dialog({
        buttons: [
            {
                text: "Done",
                click: function() {
                    addMisc();
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $("#dialogBox").dialog("close");
                }
            }
        ]
    });
}
function addArmorMod() {
    $("#dialogBoxContent ul").append(
        $("<li></li>")
            .append("Name: <input id='mod_name' /> Rating: <input type='number' id='mod_rating' /> Info: <input id='mod_info' />")
    );
}

function addLimbMod() {
    $("#dialogBoxContent ul").append(
        $("<li></li>")
            .append("Name: ").append( $("<input />").attr({id: "mod_name"}) )
            .append("Rating: ").append( $("<input />").attr( {type: "number", id: "mod_rating"} ) ).append( $("<br />") )
            .append("Capacity: ").append($("<input />").attr({type: "number", id: "mod_capacity"}) ).append( $("<br/>") )
            .append("Info: ").append( $("<textarea></textarea>").attr({id: "mod_info"}) ) );

}

function addRangedWeaponMod() {
    $("#dialogBoxContent ul").append(
        $("<li></li>")
            .append("Name: <input id='mod_name' /> Rating: <input type='number' id='mod_rating' /> Info: <input id='mod_info' />")
    );
}