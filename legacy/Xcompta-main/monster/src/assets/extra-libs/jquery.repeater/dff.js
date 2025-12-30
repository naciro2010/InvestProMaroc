var room = 1;

function education_fields() {

    room++;
    var objTo = document.getElementById('education_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '  <td><select class="form-control font-12"> <option>Fournisseur 1\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>Fournisseur 2</option>\n' +
        '                                                                                        <option>Fournisseur 3</option>\n' +
        '                                                                                        <option>Fournisseur 4</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>Axe 1\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>Axe 2</option>\n' +
        '                                                                                        <option>Axe 3</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>Projet 1\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>Projet 2</option>\n' +
        '                                                                                        <option>Projet 3</option>\n' +
        '                                                                                    </select>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>Volet 1\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>Volet 2</option>\n' +
        '                                                                                    </select></td>\n' +
        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function imputationprevisionnelle_fields() {

    room++;
    var objTo = document.getElementById('imputationprevisionnelle_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML =
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>A001\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>A002</option>\n' +
        '                                                                                        <option>A003</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>P001\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>P002</option>\n' +
        '                                                                                        <option>P003</option>\n' +
        '                                                                                    </select>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>V001\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>V002</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><input type="date" class="form-control font-12"></td>\n' +
        '                                                                                   <td><input type="text" class="form-control font-12"></td>\n' +
        '                                                                                   <td><input type="text" class="form-control font-12" placeholder="12/12/2025" disabled></td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function imputationprevisionnelle_avenant() {

    room++;
    var objTo = document.getElementById('imputationprevisionnelle_avenant')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML =
        '                                                                                    <tr><td><select class="form-control font-12">\n' +
        '                                                                                        <option>A001\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>A002</option>\n' +
        '                                                                                        <option>A003</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>P001\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>P002</option>\n' +
        '                                                                                        <option>P003</option>\n' +
        '                                                                                    </select>\n' +
        '                                                                                    <td><select class="form-control font-12">\n' +
        '                                                                                        <option>V001\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>V002</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><input type="date" class="form-control font-12"></td>\n' +
        '                                                                                   <td><input type="text" class="form-control font-12"></td>\n' +
        '                                                                                   <td><input type="text" class="form-control font-12" placeholder="12/12/2025" disabled></td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function versementperv_fields() {
    room++;
    var objTo = document.getElementById('versementperv_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML =
        '                                                                                    <td>A003</td>\n' +
        '                                                                                    <td>P001</td>\n' +
        '                                                                                    <td>V003</td>\n' +
        '                                                                                    <td>12/03/2021</td>\n' +
        '                                                                                   <td>203.093,99</td>\n' +
        '                                                                                    <td>Partenaire 1</td>\n' +
        '                                                                                    <td>MOD </td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function versementperv_avenant() {
    room++;
    var objTo = document.getElementById('versementperv_avenant')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML =
        '                                                                                    <tr><td>A003</td>\n' +
        '                                                                                    <td>P001</td>\n' +
        '                                                                                    <td>V003</td>\n' +
        '                                                                                    <td>12/03/2021</td>\n' +
        '                                                                                   <td>203.093,99</td>\n' +
        '                                                                                    <td>Partenaire 1</td>\n' +
        '                                                                                    <td>MOD </td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function partenaire_fields() {

    room++;
    var objTo = document.getElementById('partenaire_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '     <tr data-expanded="true">\n' +
        '                                                        <td style="width:20%" colspan="1"><select\n' +
        '                                                                class="form-control font-12">\n' +
        '                                                            <option> Partenaire\n' +
        '                                                            </option>\n' +
        '                                                            <option selected>Partenaire 1</option>\n' +
        '                                                            <option>Partenaire 2</option>\n' +
        '                                                            <option>Partenaire 3</option>\n' +
        '                                                            <option>Partenaire 4</option>\n' +
        '                                                        </select></td>\n' +
        '                                                        <td align="right"><input type="number"\n' +
        '                                                                                 class="form-control font-12">\n' +
        '                                                        </td>\n' +
        '                                                        <td align="right"><input type="number"\n' +
        '                                                                                 class="form-control font-12" disabled>\n' +
        '                                                        </td>\n' +
        '                                                        <td align="right"><input type="number"\n' +
        '                                                                                 class="form-control font-12" disabled>\n' +
        '                                                        </td>\n' +
        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function mo_fields() {

    room++;
    var objTo = document.getElementById('mo_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '     <tr data-expanded="true">\n' +
        '                                                        <td colspan="1"><select\n' +
        '                                                                class="form-control font-12">\n' +
        '                                                            <option>' +
        '                                                            </option>\n' +
        '                                                            <option selected>MO 1</option>\n' +
        '                                                            <option>MO 2</option>\n' +
        '                                                            <option>MO 3</option>\n' +
        '                                                            <option>MO 4</option>\n' +
        '                                                        </select></td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function mod_fields() {

    room++;
    var objTo = document.getElementById('mod_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '     <tr data-expanded="true">\n' +
        '                                                        <td  colspan="1"><select\n' +
        '                                                                class="form-control font-12">\n' +
        '                                                            <option>' +
        '                                                            </option>\n' +
        '                                                            <option selected>MOD 1</option>\n' +
        '                                                            <option>MOD 2</option>\n' +
        '                                                            <option>MOD 3</option>\n' +
        '                                                            <option>MOD 4</option>\n' +
        '                                                        </select></td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function mo_fields_avenant() {

    room++;
    var objTo = document.getElementById('mo_fields_avenant')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '     <tr data-expanded="true">\n' +
        '                                                        <td colspan="1"><select\n' +
        '                                                                class="form-control font-12">\n' +
        '                                                            <option>' +
        '                                                            </option>\n' +
        '                                                            <option selected>MO 1</option>\n' +
        '                                                            <option>MO 2</option>\n' +
        '                                                            <option>MO 3</option>\n' +
        '                                                            <option>MO 4</option>\n' +
        '                                                        </select></td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function mod_fields_avenant() {

    room++;
    var objTo = document.getElementById('mod_fields_avenant')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '     <tr data-expanded="true">\n' +
        '                                                        <td  colspan="1"><select\n' +
        '                                                                class="form-control font-12">\n' +
        '                                                            <option>' +
        '                                                            </option>\n' +
        '                                                            <option selected>MOD 1</option>\n' +
        '                                                            <option>MOD 2</option>\n' +
        '                                                            <option>MOD 3</option>\n' +
        '                                                            <option>MOD 4</option>\n' +
        '                                                        </select></td>\n' +

        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function partenaire_fields_avenant() {

    room++;
    var objTo = document.getElementById('partenaire_fields_body')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '     <tr data-expanded="true">\n' +
        '                                                        <td style="width:20%" colspan="1"><select\n' +
        '                                                                class="form-control font-12">\n' +
        '                                                            <option> Partenaire\n' +
        '                                                            </option>\n' +
        '                                                            <option selected>Partenaire 1</option>\n' +
        '                                                            <option>Partenaire 2</option>\n' +
        '                                                            <option>Partenaire 3</option>\n' +
        '                                                            <option>Partenaire 4</option>\n' +
        '                                                        </select></td>\n' +
        '                                                        <td align="right"><input type="number"\n' +
        '                                                                                 class="form-control font-12">\n' +
        '                                                        </td>\n' +
        '                                                        <td align="right"><input type="number"\n' +
        '                                                                                 class="form-control font-12" disabled>\n' +
        '                                                        </td>\n' +
        '                                                        <td align="right"><input type="number"\n' +
        '                                                                                 class="form-control font-12" disabled>\n' +
        '                                                        </td>\n' +
        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function price_fields() {

    room++;
    var objTo = document.getElementById('price_fields')
    var divtest = document.createElement("tr");
    divtest.setAttribute("class", "form-group removeclass" + room);
    var rdiv = 'removeclass' + room;
    divtest.innerHTML = '  <td><select class="form-control font-12"> <option>N° Price 1\n' +
        '                                                                                        </option>\n' +
        '                                                                                        <option>N° Price 2</option>\n' +
        '                                                                                        <option>N° Price 3</option>\n' +
        '                                                                                        <option>N° Price 4</option>\n' +
        '                                                                                    </select></td>\n' +
        '                                                                                    <td><input type="number"></td>\n' +
        '                                                                                    <td><input type="number"></td>' +
        '                                                                                    <td>123.398.312,00</td>\n' +
        '<td>  <button class="btn btn-danger font-10" type="button" onclick="remove_education_fields(' + room + ');"> <i class="fa fa-minus"></i> </button> </td></tr>';
    objTo.appendChild(divtest)
}

function remove_education_fields(rid) {
    $('.removeclass' + rid).remove();
}