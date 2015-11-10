<?xml version="1.0" ?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="/">
            <xsl:for-each select="/character/*">
                <div id="{name()}" class="sliderDiv">
                    <h3><xsl:value-of select="name()"/></h3>
                    <xsl:apply-templates select="."/>
                </div>
            </xsl:for-each>
    </xsl:template>
    <xsl:template name="attList">
        <xsl:for-each select="/character/attributes/*">
            <option value="name()"><xsl:value-of select="name()" /></option>
        </xsl:for-each>
    </xsl:template>
    <xsl:template name="generic">
        <h4><xsl:value-of select="name" /></h4>
        <xsl:for-each select="*">
            <xsl:if test="name() != 'name' and name() != 'info' and name() != 'mods'">
                <span class="sub_field"><xsl:value-of select="name()" />: <xsl:value-of select="." /></span>
            </xsl:if>
        </xsl:for-each>
        <xsl:if test="info">
            <br />
            <p><xsl:value-of select="info"/></p>
        </xsl:if>
        <xsl:if test="mods">
            <br />
            Mods:
            <ul>
                <xsl:for-each select="mods/*">
                    <li>
                        <xsl:value-of select="name" />
                        <xsl:if test="rating">
                           R<xsl:value-of select="rating" />
                        </xsl:if>
                        <xsl:if test="info">
                            , <xsl:value-of select="info" />
                        </xsl:if>
                    </li>
                </xsl:for-each>
            </ul>
        </xsl:if>
    </xsl:template>
    <xsl:template match="basic_info">
        <div>
        <h2><xsl:value-of select="name" /></h2>
        <p>
            <xsl:for-each select="/character/basic_info/*">
                <xsl:if test="name() != 'name'">
                    <span class="basicField"><xsl:value-of select="name()" />:</span><span class="editable" id="basic_info.{name()}" contenteditable="true"><xsl:value-of select="." /></span>
                </xsl:if>
            </xsl:for-each>
        </p>
        </div>
    </xsl:template>
    <xsl:template match="attributes">
        <ul id="attributes_list">
            <xsl:for-each select="*">
                <li>
                <span class="field"><xsl:value-of select="name()"/></span> : <span class="editable" id="attributes.{name()}" contenteditable="true"><xsl:value-of select="." /></span>
                    <xsl:if test="@optional='true'">
                        <span class="button_removeA" onclick="removeNode('attributes.{name()}', this)">-</span>
                    </xsl:if>
                </li>
            </xsl:for-each>
        </ul>
    </xsl:template>
    <xsl:template match="stats">
        <ul id="stats_list">
            <xsl:for-each select="*">
                <li><span class="field"><xsl:value-of select="name()"/></span> : <span class="editable" id="stats.{name()}" contenteditable="true"><xsl:value-of select="." /></span></li>
            </xsl:for-each>
        </ul>
    </xsl:template>
    <xsl:template match="qualities">
        <ul id="qualities_list">
            <xsl:for-each select="quality">
                <li><span class="button_remove" onclick="removeNode('qualities.{position()}', this)">-</span><h4><xsl:value-of select="name"/></h4>
                    <xsl:choose>
                        <xsl:when test="type = 'positive'">
                            -
                        </xsl:when>
                        <xsl:otherwise>
                            +
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:value-of select="karma"/> Karma
                    <p><xsl:value-of select="info" /></p></li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('newQuality')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template match="active_skills">
        <ul id="active_skills_list">
            <xsl:for-each select="skill_group">
                <li><span class="button_remove" onclick="removeNode('active_skills.{position()}', this)">-</span><span class="skillName"><xsl:value-of select="name" /></span> <span class="editable" id="active_skills.{position()}.rating" contenteditable="true"><xsl:value-of select="rating" /></span>
                <ul>
                    <xsl:for-each select="skill">
                        <li title="{name}|{../rating}|{attribute}"><xsl:value-of select="name"/></li>
                    </xsl:for-each>
                </ul></li>
            </xsl:for-each>
            <xsl:for-each select="skill">
                <li title="{name}|{rating}|{attribute}"><span class="button_remove" onclick="removeNode('active_skills.{position()}', this)">-</span><span class="skillName"><xsl:value-of select="name" /></span>
                    <span class="editable" id="active_skills.{position()}.rating" contenteditable="true"><xsl:value-of select="rating" /></span>
                    <xsl:for-each select="specialization">
                        <p> - (<xsl:value-of select="." />)</p>
                    </xsl:for-each>
                </li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('newActiveSkill')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template match="knowledge_skills">
        <ul>
            <xsl:for-each select="skill">
                <li><span class="button_remove" onclick="removeNode('knowledge_skills.{position()}', this)">-</span><xsl:value-of select="name"/> : <span class="editable" id="knowledge_skills.{position()}.rating" ><xsl:value-of select="rating" /></span></li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('newKnowledgeSkill')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template match="languages">
        <ul>
            <xsl:for-each select="language">
                <li><span class="button_remove" onclick="removeNode('languages.{position()}', this)">-</span><xsl:value-of select="name"/> : <span class="editable" id="languages.{position()}.rating"><xsl:value-of select="rating"/></span></li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('newLanguage')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template match="contacts">
        <ul>
            <xsl:for-each select="contact">
                <li><span class="button_remove2" onclick="removeNode('contacts.{position()}', this)">-</span>
                    <h4><xsl:value-of select="name" /></h4>
                    <p>Loyalty <span class="editable" id="contacts.{position()}.loyalty"><xsl:value-of select="loyalty" /></span> / Connection <span class="editable" id="contacts.{position()}.connection"><xsl:value-of select="connection" /></span></p>
                    <p><span class="editable" id="contacts.{position()}.info"><xsl:value-of select="info" /></span></p>
                </li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('newContact')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template name="bigList">
        <ul>
            <xsl:if test="not(*)">
                <span class="cat_remove_button" onclick="removeCat('{name()}')">-</span>
            </xsl:if>
            <xsl:for-each select="./*">
                <li><span class="button_remove2" onclick="removeNode('{name(..)}.{position()}', this)">-</span>
                    <xsl:call-template name="generic" />
                </li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('new{name()}')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template match="spells | powers | complex_forms">
        <xsl:call-template name="bigList" />
    </xsl:template>
    <xsl:template name="stuff">
        <ul>
            <xsl:if test="not(*)">
                <span class="cat_remove_button" onclick="removeCat('{name()}')">-</span>
            </xsl:if>
            <xsl:for-each select="*">
                <li id="{name()}">
                    <ul>
                        <h4><xsl:value-of select="name()"/></h4>
                        <xsl:for-each select="item">
                            <li><span class="button_remove2" onclick="removeNode('{name(../..)}.{name(..)}.{position()}', this)">-</span>
                                <xsl:call-template name="generic" />
                            </li>
                        </xsl:for-each>
                    </ul>
                </li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('new{name()}')">Add New</span>
        </ul>
    </xsl:template>
    <xsl:template match="cyberware | bioware | gear">
       <xsl:call-template name="stuff" />
    </xsl:template>
    <xsl:template match="notes">
        <ul>
            <xsl:for-each select="note">
                <li><span class="button_remove2" onclick="removeNode('notes.{position()}', this)">-</span>
                    <xsl:value-of select="content" />
                </li>
            </xsl:for-each>
            <span class="newButton" onclick="openDialog('newNote')">Add New</span>
        </ul>
    </xsl:template>
</xsl:stylesheet>