delete from user where true;

insert into user (display_name, current_text, tags)
values
	("holzi", "ich bin holzi", ""),
	("RundesBalli", "ich bin A", "Schiffe erregen mich,earthporn"),
	("Fedor", "ich bin B", "sie klauen unsere jobs"),
	("Keith", "ich bin C", "richtig fette derbe brachiale ultramelonen"),
	("SirFappington", "ich bin D", ""),
	("thewavelength", "ich bin A1", "Schiffe erregen mich,earthporn"),
	("holzmaster", "ich bin holzmaster", "RundesBalli ist geil"),
	("BlussiSchmuser", "ich bin B1", "sie klauen unsere jobs"),
	("Vissy", "ich bin C1", "richtig fette derbe brachiale ultramelonen"),
	("leReddit", "ich bin D1", ""),
	("NixName", "ich bin A2", "Schiffe erregen mich,earthporn"),
	("froschler", "ich bin B2", "sie klauen unsere jobs"),
	("vier2acht", "ich bin C2", "richtig fette derbe brachiale ultramelonen"),
	("SchmusArya", "ich bin D2", ""),
	("SeamTpeak3", "ich bin A21", "Schiffe erregen mich,earthporn"),
	("SudelNuppe", "ich bin B21", "sie klauen unsere jobs"),
	("Tiefkuehlpizza", "ich bin C21", "richtig fette derbe brachiale ultramelonen"),
	("Bausparvertrag", "ich bin D21", "");

insert into vote (user, candidate, decision, candidate_text, candidate_tags)
values
	(1, 6, true, "lol1", "lolxd,xdxd"),
	(3, 6, true, "lol3", "lolxd,xdxd"),
	(5, 6, true, "lol5", "lolxd,xdxd"),
	(7, 6, true, "lol7", "lolxd,xdxd");
