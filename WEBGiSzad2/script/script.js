require([
    'esri/Map',
    'esri/views/SceneView',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/widgets/BasemapGallery',
    'esri/widgets/LayerList',
    'esri/widgets/Expand',
    'esri/widgets/Legend',
    'esri/rest/support/Query',
    ], (Map, SceneView, FeatureLayer, GraphicsLayer, BasemapGallery, Legend, LayerList, Expand, Query) =>{
    
    const glowna_mapa = new Map({
        basemap: 'topo-vector'
    });

    const view = new SceneView({
        map: glowna_mapa,
        container: 'mapa',
        zoom: 10,
        center: [-100.4593, 36.9014]
    });

    //warstwy
    const gl = new GraphicsLayer();
    const g2 = new GraphicsLayer();

    const trzesienia = new FeatureLayer({
        url: "https://services.arcgis.com/ue9rwulIoeLEI9bj/ArcGIS/rest/services/Earthquakes/FeatureServer/0"
    });
    
    const trzesieniaquery = new FeatureLayer({
        url: "https://services.arcgis.com/ue9rwulIoeLEI9bj/ArcGIS/rest/services/Earthquakes/FeatureServer/0"
    });

    glowna_mapa.add(trzesienia);
    glowna_mapa.add(gl);
    glowna_mapa.add(g2);

    // //widgety

    const legend = new Legend({
        view: view
    });
    view.ui.add(legend, {position: "bottom-right"});

    const bmWg = new BasemapGallery({
        view: view
    });

    const expandWg = new Expand({
        view: view,
        content: bmWg
    });

    view.ui.add(expandWg,"top-right");


    // view.ui.add(layerList, {
    //     position: "top-trailing"
    // });

    // const layerList = new LayerList({
    //     view:view
    // });

    view.when(() => {
        const layerList = new LayerList({
        view: view
    });
    view.ui.add(layerList, "bottom-right");
    });

    //dodanie query
    let query = trzesieniaquery.createQuery();
    query.where =  "MAGNITUDE > 4";
    query.outfields = ['*'];
    query.returnGeometry= true; // podstawa zapytania czego wyszukujemy

    trzesieniaquery.queryFeatures(query)
    .then(response =>{
        console.log(response);
        getResults(response.features);
    })
    .catch(err => { //gdy wystapi problem
        console.log(err);
    });

    const getResults = (features) => {
        let symbol = {
            type: "simple-marker",
            size: 20,
            color: "orange",
            style: "oval"
        };
        
        features.map(elem => {
            elem.symbol = symbol;
        });

        gl.addMany(features)
    };

        // Rendering

        const simple = {
            type: "simple",
            symbol: {
                type: "point-3d",
                symbolLayers: [
                    {
                        type: "object",
                        resource: {
                            primitive: "cylinder"
                        },
                        width:5000
                    },
                ]
            },
            label: "Earthquake",
            visualVariables: [
                {
                    type: "color",
                    field: "MAGNITUDE",
                    stops: [
                        {
                            value: 4.48,
                            color: "red"
                        },
                        {
                            value: 2,
                            color: "orange"
                        },
                        {
                            value: 0.5,
                            color: "green"
                        },
                    ]
                },
                {
                    type: "size",
                    field: "DEPTH",
                    stops: [
                        {
                            value: -3.39,
                            size: 5000
                        },
                        {
                            value: 30.97,
                            size: 13000
                        },
                    ]
                }
            ]
        };
    
        trzesienia.renderer = simple;


});