/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
$(document).ready(function() {

    $(".click-title").mouseenter( function(    e){
        e.preventDefault();
        this.style.cursor="pointer";
    });
    $(".click-title").mousedown( function(event){
        event.preventDefault();
    });

    // Ugly code while this script is shared among several pages
    try{
        refreshHitsPerSecond(true);
    } catch(e){}
    try{
        refreshResponseTimeOverTime(true);
    } catch(e){}
    try{
        refreshResponseTimePercentiles();
    } catch(e){}
});


var responseTimePercentilesInfos = {
        data: {"result": {"minY": 118701.0, "minX": 0.0, "maxY": 125591.0, "series": [{"data": [[0.0, 118701.0], [0.1, 118701.0], [0.2, 118701.0], [0.3, 118701.0], [0.4, 118701.0], [0.5, 118701.0], [0.6, 118701.0], [0.7, 118701.0], [0.8, 118701.0], [0.9, 118701.0], [1.0, 118729.0], [1.1, 118729.0], [1.2, 118729.0], [1.3, 118729.0], [1.4, 118729.0], [1.5, 118729.0], [1.6, 118729.0], [1.7, 118729.0], [1.8, 118729.0], [1.9, 118729.0], [2.0, 118731.0], [2.1, 118731.0], [2.2, 118731.0], [2.3, 118731.0], [2.4, 118731.0], [2.5, 118731.0], [2.6, 118731.0], [2.7, 118731.0], [2.8, 118731.0], [2.9, 118731.0], [3.0, 119066.0], [3.1, 119066.0], [3.2, 119066.0], [3.3, 119066.0], [3.4, 119066.0], [3.5, 119066.0], [3.6, 119066.0], [3.7, 119066.0], [3.8, 119066.0], [3.9, 119066.0], [4.0, 119578.0], [4.1, 119578.0], [4.2, 119578.0], [4.3, 119578.0], [4.4, 119578.0], [4.5, 119578.0], [4.6, 119578.0], [4.7, 119578.0], [4.8, 119578.0], [4.9, 119578.0], [5.0, 120373.0], [5.1, 120373.0], [5.2, 120373.0], [5.3, 120373.0], [5.4, 120373.0], [5.5, 120373.0], [5.6, 120373.0], [5.7, 120373.0], [5.8, 120373.0], [5.9, 120373.0], [6.0, 121616.0], [6.1, 121616.0], [6.2, 121616.0], [6.3, 121616.0], [6.4, 121616.0], [6.5, 121616.0], [6.6, 121616.0], [6.7, 121616.0], [6.8, 121616.0], [6.9, 121616.0], [7.0, 121997.0], [7.1, 121997.0], [7.2, 121997.0], [7.3, 121997.0], [7.4, 121997.0], [7.5, 121997.0], [7.6, 121997.0], [7.7, 121997.0], [7.8, 121997.0], [7.9, 121997.0], [8.0, 122046.0], [8.1, 122046.0], [8.2, 122046.0], [8.3, 122046.0], [8.4, 122046.0], [8.5, 122046.0], [8.6, 122046.0], [8.7, 122046.0], [8.8, 122046.0], [8.9, 122046.0], [9.0, 122141.0], [9.1, 122141.0], [9.2, 122141.0], [9.3, 122141.0], [9.4, 122141.0], [9.5, 122141.0], [9.6, 122141.0], [9.7, 122141.0], [9.8, 122141.0], [9.9, 122141.0], [10.0, 122234.0], [10.1, 122234.0], [10.2, 122234.0], [10.3, 122234.0], [10.4, 122234.0], [10.5, 122234.0], [10.6, 122234.0], [10.7, 122234.0], [10.8, 122234.0], [10.9, 122234.0], [11.0, 122323.0], [11.1, 122323.0], [11.2, 122323.0], [11.3, 122323.0], [11.4, 122323.0], [11.5, 122323.0], [11.6, 122323.0], [11.7, 122323.0], [11.8, 122323.0], [11.9, 122323.0], [12.0, 122356.0], [12.1, 122356.0], [12.2, 122356.0], [12.3, 122356.0], [12.4, 122356.0], [12.5, 122356.0], [12.6, 122356.0], [12.7, 122356.0], [12.8, 122356.0], [12.9, 122356.0], [13.0, 122409.0], [13.1, 122409.0], [13.2, 122409.0], [13.3, 122409.0], [13.4, 122409.0], [13.5, 122409.0], [13.6, 122409.0], [13.7, 122409.0], [13.8, 122409.0], [13.9, 122409.0], [14.0, 122490.0], [14.1, 122490.0], [14.2, 122490.0], [14.3, 122490.0], [14.4, 122490.0], [14.5, 122490.0], [14.6, 122490.0], [14.7, 122490.0], [14.8, 122490.0], [14.9, 122490.0], [15.0, 122570.0], [15.1, 122570.0], [15.2, 122570.0], [15.3, 122570.0], [15.4, 122570.0], [15.5, 122570.0], [15.6, 122570.0], [15.7, 122570.0], [15.8, 122570.0], [15.9, 122570.0], [16.0, 122639.0], [16.1, 122639.0], [16.2, 122639.0], [16.3, 122639.0], [16.4, 122639.0], [16.5, 122639.0], [16.6, 122639.0], [16.7, 122639.0], [16.8, 122639.0], [16.9, 122639.0], [17.0, 122709.0], [17.1, 122709.0], [17.2, 122709.0], [17.3, 122709.0], [17.4, 122709.0], [17.5, 122709.0], [17.6, 122709.0], [17.7, 122709.0], [17.8, 122709.0], [17.9, 122709.0], [18.0, 122768.0], [18.1, 122768.0], [18.2, 122768.0], [18.3, 122768.0], [18.4, 122768.0], [18.5, 122768.0], [18.6, 122768.0], [18.7, 122768.0], [18.8, 122768.0], [18.9, 122768.0], [19.0, 122840.0], [19.1, 122840.0], [19.2, 122840.0], [19.3, 122840.0], [19.4, 122840.0], [19.5, 122840.0], [19.6, 122840.0], [19.7, 122840.0], [19.8, 122840.0], [19.9, 122840.0], [20.0, 122907.0], [20.1, 122907.0], [20.2, 122907.0], [20.3, 122907.0], [20.4, 122907.0], [20.5, 122907.0], [20.6, 122907.0], [20.7, 122907.0], [20.8, 122907.0], [20.9, 122907.0], [21.0, 122912.0], [21.1, 122912.0], [21.2, 122912.0], [21.3, 122912.0], [21.4, 122912.0], [21.5, 122912.0], [21.6, 122912.0], [21.7, 122912.0], [21.8, 122912.0], [21.9, 122912.0], [22.0, 122975.0], [22.1, 122975.0], [22.2, 122975.0], [22.3, 122975.0], [22.4, 122975.0], [22.5, 122975.0], [22.6, 122975.0], [22.7, 122975.0], [22.8, 122975.0], [22.9, 122975.0], [23.0, 123029.0], [23.1, 123029.0], [23.2, 123029.0], [23.3, 123029.0], [23.4, 123029.0], [23.5, 123029.0], [23.6, 123029.0], [23.7, 123029.0], [23.8, 123029.0], [23.9, 123029.0], [24.0, 123069.0], [24.1, 123069.0], [24.2, 123069.0], [24.3, 123069.0], [24.4, 123069.0], [24.5, 123069.0], [24.6, 123069.0], [24.7, 123069.0], [24.8, 123069.0], [24.9, 123069.0], [25.0, 123105.0], [25.1, 123105.0], [25.2, 123105.0], [25.3, 123105.0], [25.4, 123105.0], [25.5, 123105.0], [25.6, 123105.0], [25.7, 123105.0], [25.8, 123105.0], [25.9, 123105.0], [26.0, 123155.0], [26.1, 123155.0], [26.2, 123155.0], [26.3, 123155.0], [26.4, 123155.0], [26.5, 123155.0], [26.6, 123155.0], [26.7, 123155.0], [26.8, 123155.0], [26.9, 123155.0], [27.0, 123210.0], [27.1, 123210.0], [27.2, 123210.0], [27.3, 123210.0], [27.4, 123210.0], [27.5, 123210.0], [27.6, 123210.0], [27.7, 123210.0], [27.8, 123210.0], [27.9, 123210.0], [28.0, 123245.0], [28.1, 123245.0], [28.2, 123245.0], [28.3, 123245.0], [28.4, 123245.0], [28.5, 123245.0], [28.6, 123245.0], [28.7, 123245.0], [28.8, 123245.0], [28.9, 123245.0], [29.0, 123264.0], [29.1, 123264.0], [29.2, 123264.0], [29.3, 123264.0], [29.4, 123264.0], [29.5, 123264.0], [29.6, 123264.0], [29.7, 123264.0], [29.8, 123264.0], [29.9, 123264.0], [30.0, 123333.0], [30.1, 123333.0], [30.2, 123333.0], [30.3, 123333.0], [30.4, 123333.0], [30.5, 123333.0], [30.6, 123333.0], [30.7, 123333.0], [30.8, 123333.0], [30.9, 123333.0], [31.0, 123406.0], [31.1, 123406.0], [31.2, 123406.0], [31.3, 123406.0], [31.4, 123406.0], [31.5, 123406.0], [31.6, 123406.0], [31.7, 123406.0], [31.8, 123406.0], [31.9, 123406.0], [32.0, 123482.0], [32.1, 123482.0], [32.2, 123482.0], [32.3, 123482.0], [32.4, 123482.0], [32.5, 123482.0], [32.6, 123482.0], [32.7, 123482.0], [32.8, 123482.0], [32.9, 123482.0], [33.0, 123489.0], [33.1, 123489.0], [33.2, 123489.0], [33.3, 123489.0], [33.4, 123489.0], [33.5, 123489.0], [33.6, 123489.0], [33.7, 123489.0], [33.8, 123489.0], [33.9, 123489.0], [34.0, 123547.0], [34.1, 123547.0], [34.2, 123547.0], [34.3, 123547.0], [34.4, 123547.0], [34.5, 123547.0], [34.6, 123547.0], [34.7, 123547.0], [34.8, 123547.0], [34.9, 123547.0], [35.0, 123621.0], [35.1, 123621.0], [35.2, 123621.0], [35.3, 123621.0], [35.4, 123621.0], [35.5, 123621.0], [35.6, 123621.0], [35.7, 123621.0], [35.8, 123621.0], [35.9, 123621.0], [36.0, 123685.0], [36.1, 123685.0], [36.2, 123685.0], [36.3, 123685.0], [36.4, 123685.0], [36.5, 123685.0], [36.6, 123685.0], [36.7, 123685.0], [36.8, 123685.0], [36.9, 123685.0], [37.0, 123768.0], [37.1, 123768.0], [37.2, 123768.0], [37.3, 123768.0], [37.4, 123768.0], [37.5, 123768.0], [37.6, 123768.0], [37.7, 123768.0], [37.8, 123768.0], [37.9, 123768.0], [38.0, 123841.0], [38.1, 123841.0], [38.2, 123841.0], [38.3, 123841.0], [38.4, 123841.0], [38.5, 123841.0], [38.6, 123841.0], [38.7, 123841.0], [38.8, 123841.0], [38.9, 123841.0], [39.0, 123847.0], [39.1, 123847.0], [39.2, 123847.0], [39.3, 123847.0], [39.4, 123847.0], [39.5, 123847.0], [39.6, 123847.0], [39.7, 123847.0], [39.8, 123847.0], [39.9, 123847.0], [40.0, 123907.0], [40.1, 123907.0], [40.2, 123907.0], [40.3, 123907.0], [40.4, 123907.0], [40.5, 123907.0], [40.6, 123907.0], [40.7, 123907.0], [40.8, 123907.0], [40.9, 123907.0], [41.0, 123968.0], [41.1, 123968.0], [41.2, 123968.0], [41.3, 123968.0], [41.4, 123968.0], [41.5, 123968.0], [41.6, 123968.0], [41.7, 123968.0], [41.8, 123968.0], [41.9, 123968.0], [42.0, 123980.0], [42.1, 123980.0], [42.2, 123980.0], [42.3, 123980.0], [42.4, 123980.0], [42.5, 123980.0], [42.6, 123980.0], [42.7, 123980.0], [42.8, 123980.0], [42.9, 123980.0], [43.0, 124022.0], [43.1, 124022.0], [43.2, 124022.0], [43.3, 124022.0], [43.4, 124022.0], [43.5, 124022.0], [43.6, 124022.0], [43.7, 124022.0], [43.8, 124022.0], [43.9, 124022.0], [44.0, 124033.0], [44.1, 124033.0], [44.2, 124033.0], [44.3, 124033.0], [44.4, 124033.0], [44.5, 124033.0], [44.6, 124033.0], [44.7, 124033.0], [44.8, 124033.0], [44.9, 124033.0], [45.0, 124035.0], [45.1, 124035.0], [45.2, 124035.0], [45.3, 124035.0], [45.4, 124035.0], [45.5, 124035.0], [45.6, 124035.0], [45.7, 124035.0], [45.8, 124035.0], [45.9, 124035.0], [46.0, 124039.0], [46.1, 124039.0], [46.2, 124039.0], [46.3, 124039.0], [46.4, 124039.0], [46.5, 124039.0], [46.6, 124039.0], [46.7, 124039.0], [46.8, 124039.0], [46.9, 124039.0], [47.0, 124082.0], [47.1, 124082.0], [47.2, 124082.0], [47.3, 124082.0], [47.4, 124082.0], [47.5, 124082.0], [47.6, 124082.0], [47.7, 124082.0], [47.8, 124082.0], [47.9, 124082.0], [48.0, 124097.0], [48.1, 124097.0], [48.2, 124097.0], [48.3, 124097.0], [48.4, 124097.0], [48.5, 124097.0], [48.6, 124097.0], [48.7, 124097.0], [48.8, 124097.0], [48.9, 124097.0], [49.0, 124166.0], [49.1, 124166.0], [49.2, 124166.0], [49.3, 124166.0], [49.4, 124166.0], [49.5, 124166.0], [49.6, 124166.0], [49.7, 124166.0], [49.8, 124166.0], [49.9, 124166.0], [50.0, 124197.0], [50.1, 124197.0], [50.2, 124197.0], [50.3, 124197.0], [50.4, 124197.0], [50.5, 124197.0], [50.6, 124197.0], [50.7, 124197.0], [50.8, 124197.0], [50.9, 124197.0], [51.0, 124255.0], [51.1, 124255.0], [51.2, 124255.0], [51.3, 124255.0], [51.4, 124255.0], [51.5, 124255.0], [51.6, 124255.0], [51.7, 124255.0], [51.8, 124255.0], [51.9, 124255.0], [52.0, 124331.0], [52.1, 124331.0], [52.2, 124331.0], [52.3, 124331.0], [52.4, 124331.0], [52.5, 124331.0], [52.6, 124331.0], [52.7, 124331.0], [52.8, 124331.0], [52.9, 124331.0], [53.0, 124343.0], [53.1, 124343.0], [53.2, 124343.0], [53.3, 124343.0], [53.4, 124343.0], [53.5, 124343.0], [53.6, 124343.0], [53.7, 124343.0], [53.8, 124343.0], [53.9, 124343.0], [54.0, 124416.0], [54.1, 124416.0], [54.2, 124416.0], [54.3, 124416.0], [54.4, 124416.0], [54.5, 124416.0], [54.6, 124416.0], [54.7, 124416.0], [54.8, 124416.0], [54.9, 124416.0], [55.0, 124506.0], [55.1, 124506.0], [55.2, 124506.0], [55.3, 124506.0], [55.4, 124506.0], [55.5, 124506.0], [55.6, 124506.0], [55.7, 124506.0], [55.8, 124506.0], [55.9, 124506.0], [56.0, 124591.0], [56.1, 124591.0], [56.2, 124591.0], [56.3, 124591.0], [56.4, 124591.0], [56.5, 124591.0], [56.6, 124591.0], [56.7, 124591.0], [56.8, 124591.0], [56.9, 124591.0], [57.0, 124593.0], [57.1, 124593.0], [57.2, 124593.0], [57.3, 124593.0], [57.4, 124593.0], [57.5, 124593.0], [57.6, 124593.0], [57.7, 124593.0], [57.8, 124593.0], [57.9, 124593.0], [58.0, 124666.0], [58.1, 124666.0], [58.2, 124666.0], [58.3, 124666.0], [58.4, 124666.0], [58.5, 124666.0], [58.6, 124666.0], [58.7, 124666.0], [58.8, 124666.0], [58.9, 124666.0], [59.0, 124729.0], [59.1, 124729.0], [59.2, 124729.0], [59.3, 124729.0], [59.4, 124729.0], [59.5, 124729.0], [59.6, 124729.0], [59.7, 124729.0], [59.8, 124729.0], [59.9, 124729.0], [60.0, 124793.0], [60.1, 124793.0], [60.2, 124793.0], [60.3, 124793.0], [60.4, 124793.0], [60.5, 124793.0], [60.6, 124793.0], [60.7, 124793.0], [60.8, 124793.0], [60.9, 124793.0], [61.0, 124826.0], [61.1, 124826.0], [61.2, 124826.0], [61.3, 124826.0], [61.4, 124826.0], [61.5, 124826.0], [61.6, 124826.0], [61.7, 124826.0], [61.8, 124826.0], [61.9, 124826.0], [62.0, 124865.0], [62.1, 124865.0], [62.2, 124865.0], [62.3, 124865.0], [62.4, 124865.0], [62.5, 124865.0], [62.6, 124865.0], [62.7, 124865.0], [62.8, 124865.0], [62.9, 124865.0], [63.0, 124877.0], [63.1, 124877.0], [63.2, 124877.0], [63.3, 124877.0], [63.4, 124877.0], [63.5, 124877.0], [63.6, 124877.0], [63.7, 124877.0], [63.8, 124877.0], [63.9, 124877.0], [64.0, 124916.0], [64.1, 124916.0], [64.2, 124916.0], [64.3, 124916.0], [64.4, 124916.0], [64.5, 124916.0], [64.6, 124916.0], [64.7, 124916.0], [64.8, 124916.0], [64.9, 124916.0], [65.0, 124944.0], [65.1, 124944.0], [65.2, 124944.0], [65.3, 124944.0], [65.4, 124944.0], [65.5, 124944.0], [65.6, 124944.0], [65.7, 124944.0], [65.8, 124944.0], [65.9, 124944.0], [66.0, 124949.0], [66.1, 124949.0], [66.2, 124949.0], [66.3, 124949.0], [66.4, 124949.0], [66.5, 124949.0], [66.6, 124949.0], [66.7, 124949.0], [66.8, 124949.0], [66.9, 124949.0], [67.0, 124976.0], [67.1, 124976.0], [67.2, 124976.0], [67.3, 124976.0], [67.4, 124976.0], [67.5, 124976.0], [67.6, 124976.0], [67.7, 124976.0], [67.8, 124976.0], [67.9, 124976.0], [68.0, 125010.0], [68.1, 125010.0], [68.2, 125010.0], [68.3, 125010.0], [68.4, 125010.0], [68.5, 125010.0], [68.6, 125010.0], [68.7, 125010.0], [68.8, 125010.0], [68.9, 125010.0], [69.0, 125039.0], [69.1, 125039.0], [69.2, 125039.0], [69.3, 125039.0], [69.4, 125039.0], [69.5, 125039.0], [69.6, 125039.0], [69.7, 125039.0], [69.8, 125039.0], [69.9, 125039.0], [70.0, 125066.0], [70.1, 125066.0], [70.2, 125066.0], [70.3, 125066.0], [70.4, 125066.0], [70.5, 125066.0], [70.6, 125066.0], [70.7, 125066.0], [70.8, 125066.0], [70.9, 125066.0], [71.0, 125110.0], [71.1, 125110.0], [71.2, 125110.0], [71.3, 125110.0], [71.4, 125110.0], [71.5, 125110.0], [71.6, 125110.0], [71.7, 125110.0], [71.8, 125110.0], [71.9, 125110.0], [72.0, 125121.0], [72.1, 125121.0], [72.2, 125121.0], [72.3, 125121.0], [72.4, 125121.0], [72.5, 125121.0], [72.6, 125121.0], [72.7, 125121.0], [72.8, 125121.0], [72.9, 125121.0], [73.0, 125146.0], [73.1, 125146.0], [73.2, 125146.0], [73.3, 125146.0], [73.4, 125146.0], [73.5, 125146.0], [73.6, 125146.0], [73.7, 125146.0], [73.8, 125146.0], [73.9, 125146.0], [74.0, 125180.0], [74.1, 125180.0], [74.2, 125180.0], [74.3, 125180.0], [74.4, 125180.0], [74.5, 125180.0], [74.6, 125180.0], [74.7, 125180.0], [74.8, 125180.0], [74.9, 125180.0], [75.0, 125191.0], [75.1, 125191.0], [75.2, 125191.0], [75.3, 125191.0], [75.4, 125191.0], [75.5, 125191.0], [75.6, 125191.0], [75.7, 125191.0], [75.8, 125191.0], [75.9, 125191.0], [76.0, 125198.0], [76.1, 125198.0], [76.2, 125198.0], [76.3, 125198.0], [76.4, 125198.0], [76.5, 125198.0], [76.6, 125198.0], [76.7, 125198.0], [76.8, 125198.0], [76.9, 125198.0], [77.0, 125225.0], [77.1, 125225.0], [77.2, 125225.0], [77.3, 125225.0], [77.4, 125225.0], [77.5, 125225.0], [77.6, 125225.0], [77.7, 125225.0], [77.8, 125225.0], [77.9, 125225.0], [78.0, 125230.0], [78.1, 125230.0], [78.2, 125230.0], [78.3, 125230.0], [78.4, 125230.0], [78.5, 125230.0], [78.6, 125230.0], [78.7, 125230.0], [78.8, 125230.0], [78.9, 125230.0], [79.0, 125251.0], [79.1, 125251.0], [79.2, 125251.0], [79.3, 125251.0], [79.4, 125251.0], [79.5, 125251.0], [79.6, 125251.0], [79.7, 125251.0], [79.8, 125251.0], [79.9, 125251.0], [80.0, 125253.0], [80.1, 125253.0], [80.2, 125253.0], [80.3, 125253.0], [80.4, 125253.0], [80.5, 125253.0], [80.6, 125253.0], [80.7, 125253.0], [80.8, 125253.0], [80.9, 125253.0], [81.0, 125256.0], [81.1, 125256.0], [81.2, 125256.0], [81.3, 125256.0], [81.4, 125256.0], [81.5, 125256.0], [81.6, 125256.0], [81.7, 125256.0], [81.8, 125256.0], [81.9, 125256.0], [82.0, 125276.0], [82.1, 125276.0], [82.2, 125276.0], [82.3, 125276.0], [82.4, 125276.0], [82.5, 125276.0], [82.6, 125276.0], [82.7, 125276.0], [82.8, 125276.0], [82.9, 125276.0], [83.0, 125278.0], [83.1, 125278.0], [83.2, 125278.0], [83.3, 125278.0], [83.4, 125278.0], [83.5, 125278.0], [83.6, 125278.0], [83.7, 125278.0], [83.8, 125278.0], [83.9, 125278.0], [84.0, 125316.0], [84.1, 125316.0], [84.2, 125316.0], [84.3, 125316.0], [84.4, 125316.0], [84.5, 125316.0], [84.6, 125316.0], [84.7, 125316.0], [84.8, 125316.0], [84.9, 125316.0], [85.0, 125340.0], [85.1, 125340.0], [85.2, 125340.0], [85.3, 125340.0], [85.4, 125340.0], [85.5, 125340.0], [85.6, 125340.0], [85.7, 125340.0], [85.8, 125340.0], [85.9, 125340.0], [86.0, 125365.0], [86.1, 125365.0], [86.2, 125365.0], [86.3, 125365.0], [86.4, 125365.0], [86.5, 125365.0], [86.6, 125365.0], [86.7, 125365.0], [86.8, 125365.0], [86.9, 125365.0], [87.0, 125389.0], [87.1, 125389.0], [87.2, 125389.0], [87.3, 125389.0], [87.4, 125389.0], [87.5, 125389.0], [87.6, 125389.0], [87.7, 125389.0], [87.8, 125389.0], [87.9, 125389.0], [88.0, 125423.0], [88.1, 125423.0], [88.2, 125423.0], [88.3, 125423.0], [88.4, 125423.0], [88.5, 125423.0], [88.6, 125423.0], [88.7, 125423.0], [88.8, 125423.0], [88.9, 125423.0], [89.0, 125427.0], [89.1, 125427.0], [89.2, 125427.0], [89.3, 125427.0], [89.4, 125427.0], [89.5, 125427.0], [89.6, 125427.0], [89.7, 125427.0], [89.8, 125427.0], [89.9, 125427.0], [90.0, 125482.0], [90.1, 125482.0], [90.2, 125482.0], [90.3, 125482.0], [90.4, 125482.0], [90.5, 125482.0], [90.6, 125482.0], [90.7, 125482.0], [90.8, 125482.0], [90.9, 125482.0], [91.0, 125494.0], [91.1, 125494.0], [91.2, 125494.0], [91.3, 125494.0], [91.4, 125494.0], [91.5, 125494.0], [91.6, 125494.0], [91.7, 125494.0], [91.8, 125494.0], [91.9, 125494.0], [92.0, 125495.0], [92.1, 125495.0], [92.2, 125495.0], [92.3, 125495.0], [92.4, 125495.0], [92.5, 125495.0], [92.6, 125495.0], [92.7, 125495.0], [92.8, 125495.0], [92.9, 125495.0], [93.0, 125495.0], [93.1, 125495.0], [93.2, 125495.0], [93.3, 125495.0], [93.4, 125495.0], [93.5, 125495.0], [93.6, 125495.0], [93.7, 125495.0], [93.8, 125495.0], [93.9, 125495.0], [94.0, 125497.0], [94.1, 125497.0], [94.2, 125497.0], [94.3, 125497.0], [94.4, 125497.0], [94.5, 125497.0], [94.6, 125497.0], [94.7, 125497.0], [94.8, 125497.0], [94.9, 125497.0], [95.0, 125534.0], [95.1, 125534.0], [95.2, 125534.0], [95.3, 125534.0], [95.4, 125534.0], [95.5, 125534.0], [95.6, 125534.0], [95.7, 125534.0], [95.8, 125534.0], [95.9, 125534.0], [96.0, 125544.0], [96.1, 125544.0], [96.2, 125544.0], [96.3, 125544.0], [96.4, 125544.0], [96.5, 125544.0], [96.6, 125544.0], [96.7, 125544.0], [96.8, 125544.0], [96.9, 125544.0], [97.0, 125587.0], [97.1, 125587.0], [97.2, 125587.0], [97.3, 125587.0], [97.4, 125587.0], [97.5, 125587.0], [97.6, 125587.0], [97.7, 125587.0], [97.8, 125587.0], [97.9, 125587.0], [98.0, 125588.0], [98.1, 125588.0], [98.2, 125588.0], [98.3, 125588.0], [98.4, 125588.0], [98.5, 125588.0], [98.6, 125588.0], [98.7, 125588.0], [98.8, 125588.0], [98.9, 125588.0], [99.0, 125591.0], [99.1, 125591.0], [99.2, 125591.0], [99.3, 125591.0], [99.4, 125591.0], [99.5, 125591.0], [99.6, 125591.0], [99.7, 125591.0], [99.8, 125591.0], [99.9, 125591.0]], "isOverall": false, "label": "TopUsers(naive)", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Response Time Percentiles"}},
        getOptions: function() {
            return {
                series: {
                    points: { show: false }
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentiles'
                },
                xaxis: {
                    tickDecimals: 1,
                    axisLabel: "Percentiles",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Percentile value in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : %x.2 percentile was %y ms"
                },
                selection: { mode: "xy" },
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentiles"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesPercentiles"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesPercentiles"), dataset, prepareOverviewOptions(options));
        }
};

/**
 * @param elementId Id of element where we display message
 */
function setEmptyGraph(elementId) {
    $(function() {
        $(elementId).text("No graph series with filter="+seriesFilter);
    });
}

// Response times percentiles
function refreshResponseTimePercentiles() {
    var infos = responseTimePercentilesInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimePercentiles");
        return;
    }
    if (isGraph($("#flotResponseTimesPercentiles"))){
        infos.createGraph();
    } else {
        var choiceContainer = $("#choicesResponseTimePercentiles");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesPercentiles", "#overviewResponseTimesPercentiles");
        $('#bodyResponseTimePercentiles .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimeDistributionInfos = {
        data: {"result": {"minY": 1.0, "minX": 118700.0, "maxY": 7.0, "series": [{"data": [[118700.0, 3.0], [121900.0, 1.0], [119000.0, 1.0], [119500.0, 1.0], [120300.0, 1.0], [121600.0, 1.0], [122300.0, 2.0], [122200.0, 1.0], [122100.0, 1.0], [122000.0, 1.0], [122500.0, 1.0], [122400.0, 2.0], [122800.0, 1.0], [122700.0, 2.0], [122600.0, 1.0], [124500.0, 3.0], [122900.0, 3.0], [123100.0, 2.0], [123000.0, 2.0], [123200.0, 3.0], [123400.0, 3.0], [123300.0, 1.0], [123500.0, 1.0], [123700.0, 1.0], [123600.0, 2.0], [123800.0, 2.0], [123900.0, 3.0], [125000.0, 3.0], [125100.0, 6.0], [125200.0, 7.0], [125300.0, 4.0], [125400.0, 7.0], [125500.0, 5.0], [124000.0, 6.0], [124100.0, 2.0], [124300.0, 2.0], [124200.0, 1.0], [124400.0, 1.0], [124900.0, 4.0], [124800.0, 3.0], [124700.0, 2.0], [124600.0, 1.0]], "isOverall": false, "label": "TopUsers(naive)", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 100, "maxX": 125500.0, "title": "Response Time Distribution"}},
        getOptions: function() {
            var granularity = this.data.result.granularity;
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    barWidth: this.data.result.granularity
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " responses for " + label + " were between " + xval + " and " + (xval + granularity) + " ms";
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimeDistribution"), prepareData(data.result.series, $("#choicesResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshResponseTimeDistribution() {
    var infos = responseTimeDistributionInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeDistribution");
        return;
    }
    if (isGraph($("#flotResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var syntheticResponseTimeDistributionInfos = {
        data: {"result": {"minY": 100.0, "minX": 2.0, "ticks": [[0, "Requests having \nresponse time <= 500ms"], [1, "Requests having \nresponse time > 500ms and <= 1,500ms"], [2, "Requests having \nresponse time > 1,500ms"], [3, "Requests in error"]], "maxY": 100.0, "series": [{"data": [], "color": "#9ACD32", "isOverall": false, "label": "Requests having \nresponse time <= 500ms", "isController": false}, {"data": [], "color": "yellow", "isOverall": false, "label": "Requests having \nresponse time > 500ms and <= 1,500ms", "isController": false}, {"data": [[2.0, 100.0]], "color": "orange", "isOverall": false, "label": "Requests having \nresponse time > 1,500ms", "isController": false}, {"data": [], "color": "#FF6347", "isOverall": false, "label": "Requests in error", "isController": false}], "supportsControllersDiscrimination": false, "maxX": 2.0, "title": "Synthetic Response Times Distribution"}},
        getOptions: function() {
            return {
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendSyntheticResponseTimeDistribution'
                },
                xaxis:{
                    axisLabel: "Response times ranges",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                    tickLength:0,
                    min:-0.5,
                    max:3.5
                },
                yaxis: {
                    axisLabel: "Number of responses",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                bars : {
                    show: true,
                    align: "center",
                    barWidth: 0.25,
                    fill:.75
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem){
                        return yval + " " + label;
                    }
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var options = this.getOptions();
            prepareOptions(options, data);
            options.xaxis.ticks = data.result.ticks;
            $.plot($("#flotSyntheticResponseTimeDistribution"), prepareData(data.result.series, $("#choicesSyntheticResponseTimeDistribution")), options);
        }

};

// Response time distribution
function refreshSyntheticResponseTimeDistribution() {
    var infos = syntheticResponseTimeDistributionInfos;
    prepareSeries(infos.data, true);
    if (isGraph($("#flotSyntheticResponseTimeDistribution"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        $('#footerSyntheticResponseTimeDistribution .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var activeThreadsOverTimeInfos = {
        data: {"result": {"minY": 50.51, "minX": 1.7792979E12, "maxY": 50.51, "series": [{"data": [[1.7792979E12, 50.51]], "isOverall": false, "label": "Thread Group", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7792979E12, "title": "Active Threads Over Time"}},
        getOptions: function() {
            return {
                series: {
                    stack: true,
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 6,
                    show: true,
                    container: '#legendActiveThreadsOverTime'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                selection: {
                    mode: 'xy'
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : At %x there were %y active threads"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesActiveThreadsOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotActiveThreadsOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewActiveThreadsOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Active Threads Over Time
function refreshActiveThreadsOverTime(fixTimestamps) {
    var infos = activeThreadsOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotActiveThreadsOverTime"))) {
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesActiveThreadsOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotActiveThreadsOverTime", "#overviewActiveThreadsOverTime");
        $('#footerActiveThreadsOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var timeVsThreadsInfos = {
        data: {"result": {"minY": 118701.0, "minX": 1.0, "maxY": 125591.0, "series": [{"data": [[2.0, 122141.0], [3.0, 122234.0], [4.0, 122323.0], [5.0, 122409.0], [6.0, 122490.0], [7.0, 122570.0], [8.0, 122639.0], [9.0, 122709.0], [10.0, 122768.0], [11.0, 122840.0], [12.0, 122907.0], [13.0, 122975.0], [14.0, 123029.0], [15.0, 123069.0], [16.0, 123105.0], [17.0, 123155.0], [18.0, 123210.0], [19.0, 123264.0], [20.0, 123333.0], [21.0, 123406.0], [22.0, 123482.0], [23.0, 123547.0], [24.0, 123621.0], [25.0, 123685.0], [26.0, 123768.0], [27.0, 123847.0], [28.0, 123907.0], [29.0, 123968.0], [30.0, 124035.0], [31.0, 124097.0], [33.0, 124255.0], [32.0, 124166.0], [35.0, 124416.0], [34.0, 124331.0], [37.0, 124591.0], [36.0, 124506.0], [39.0, 124729.0], [38.0, 124666.0], [41.0, 124826.0], [40.0, 124793.0], [43.0, 124877.0], [42.0, 124865.0], [45.0, 124944.0], [44.0, 124916.0], [47.0, 125010.0], [46.0, 124976.0], [49.0, 125066.0], [48.0, 125039.0], [51.0, 125146.0], [50.0, 125110.0], [53.0, 125198.0], [52.0, 125180.0], [55.0, 125251.0], [54.0, 125225.0], [57.0, 125316.0], [56.0, 125278.0], [59.0, 125389.0], [58.0, 125365.0], [61.0, 125482.0], [60.0, 125423.0], [63.0, 125587.0], [62.0, 125544.0], [67.0, 125494.0], [66.0, 125534.0], [65.0, 125588.0], [64.0, 125591.0], [71.0, 125427.0], [70.0, 125497.0], [69.0, 125495.0], [68.0, 125495.0], [75.0, 125256.0], [74.0, 125253.0], [73.0, 125276.0], [72.0, 125340.0], [79.0, 124949.0], [78.0, 125121.0], [77.0, 125191.0], [76.0, 125230.0], [83.0, 124082.0], [82.0, 124197.0], [81.0, 124343.0], [80.0, 124593.0], [87.0, 123980.0], [86.0, 124022.0], [85.0, 124033.0], [84.0, 124039.0], [91.0, 122912.0], [90.0, 123245.0], [89.0, 123489.0], [88.0, 123841.0], [95.0, 120373.0], [94.0, 121616.0], [93.0, 121997.0], [92.0, 122356.0], [98.0, 118701.0], [97.0, 119066.0], [96.0, 119578.0], [100.0, 118730.0], [1.0, 122046.0]], "isOverall": false, "label": "TopUsers(naive)", "isController": false}, {"data": [[50.51, 123897.05000000002]], "isOverall": false, "label": "TopUsers(naive)-Aggregated", "isController": false}], "supportsControllersDiscrimination": true, "maxX": 100.0, "title": "Time VS Threads"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    axisLabel: "Number of active threads",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response times in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: { noColumns: 2,show: true, container: '#legendTimeVsThreads' },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: At %x.2 active threads, Average response time was %y.2 ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesTimeVsThreads"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotTimesVsThreads"), dataset, options);
            // setup overview
            $.plot($("#overviewTimesVsThreads"), dataset, prepareOverviewOptions(options));
        }
};

// Time vs threads
function refreshTimeVsThreads(){
    var infos = timeVsThreadsInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTimeVsThreads");
        return;
    }
    if(isGraph($("#flotTimesVsThreads"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTimeVsThreads");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTimesVsThreads", "#overviewTimesVsThreads");
        $('#footerTimeVsThreads .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var bytesThroughputOverTimeInfos = {
        data : {"result": {"minY": 253.33333333333334, "minX": 1.7792979E12, "maxY": 8438.333333333334, "series": [{"data": [[1.7792979E12, 8438.333333333334]], "isOverall": false, "label": "Bytes received per second", "isController": false}, {"data": [[1.7792979E12, 253.33333333333334]], "isOverall": false, "label": "Bytes sent per second", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7792979E12, "title": "Bytes Throughput Over Time"}},
        getOptions : function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity) ,
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Bytes / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendBytesThroughputOverTime'
                },
                selection: {
                    mode: "xy"
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y"
                }
            };
        },
        createGraph : function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesBytesThroughputOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotBytesThroughputOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewBytesThroughputOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Bytes throughput Over Time
function refreshBytesThroughputOverTime(fixTimestamps) {
    var infos = bytesThroughputOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotBytesThroughputOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesBytesThroughputOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotBytesThroughputOverTime", "#overviewBytesThroughputOverTime");
        $('#footerBytesThroughputOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var responseTimesOverTimeInfos = {
        data: {"result": {"minY": 123897.05000000002, "minX": 1.7792979E12, "maxY": 123897.05000000002, "series": [{"data": [[1.7792979E12, 123897.05000000002]], "isOverall": false, "label": "TopUsers(naive)", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7792979E12, "title": "Response Time Over Time"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average response time was %y ms"
                }
            };
        },
        createGraph: function() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Times Over Time
function refreshResponseTimeOverTime(fixTimestamps) {
    var infos = responseTimesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyResponseTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotResponseTimesOverTime"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimesOverTime", "#overviewResponseTimesOverTime");
        $('#footerResponseTimesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var latenciesOverTimeInfos = {
        data: {"result": {"minY": 123896.79999999996, "minX": 1.7792979E12, "maxY": 123896.79999999996, "series": [{"data": [[1.7792979E12, 123896.79999999996]], "isOverall": false, "label": "TopUsers(naive)", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7792979E12, "title": "Latencies Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average response latencies in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendLatenciesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average latency was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesLatenciesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotLatenciesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewLatenciesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Latencies Over Time
function refreshLatenciesOverTime(fixTimestamps) {
    var infos = latenciesOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyLatenciesOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotLatenciesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesLatenciesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotLatenciesOverTime", "#overviewLatenciesOverTime");
        $('#footerLatenciesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var connectTimeOverTimeInfos = {
        data: {"result": {"minY": 1.9199999999999988, "minX": 1.7792979E12, "maxY": 1.9199999999999988, "series": [{"data": [[1.7792979E12, 1.9199999999999988]], "isOverall": false, "label": "TopUsers(naive)", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7792979E12, "title": "Connect Time Over Time"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getConnectTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Average Connect Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendConnectTimeOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Average connect time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesConnectTimeOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotConnectTimeOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewConnectTimeOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Connect Time Over Time
function refreshConnectTimeOverTime(fixTimestamps) {
    var infos = connectTimeOverTimeInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyConnectTimeOverTime");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotConnectTimeOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesConnectTimeOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotConnectTimeOverTime", "#overviewConnectTimeOverTime");
        $('#footerConnectTimeOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var responseTimePercentilesOverTimeInfos = {
        data: {"result": {"minY": 118701.0, "minX": 1.7792979E12, "maxY": 125591.0, "series": [{"data": [[1.7792979E12, 125591.0]], "isOverall": false, "label": "Max", "isController": false}, {"data": [[1.7792979E12, 125476.5]], "isOverall": false, "label": "90th percentile", "isController": false}, {"data": [[1.7792979E12, 125590.97]], "isOverall": false, "label": "99th percentile", "isController": false}, {"data": [[1.7792979E12, 125532.15]], "isOverall": false, "label": "95th percentile", "isController": false}, {"data": [[1.7792979E12, 118701.0]], "isOverall": false, "label": "Min", "isController": false}, {"data": [[1.7792979E12, 124181.5]], "isOverall": false, "label": "Median", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7792979E12, "title": "Response Time Percentiles Over Time (successful requests only)"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true,
                        fill: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Response Time in ms",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: '#legendResponseTimePercentilesOverTime'
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s : at %x Response time was %y ms"
                }
            };
        },
        createGraph: function () {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesResponseTimePercentilesOverTime"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotResponseTimePercentilesOverTime"), dataset, options);
            // setup overview
            $.plot($("#overviewResponseTimePercentilesOverTime"), dataset, prepareOverviewOptions(options));
        }
};

// Response Time Percentiles Over Time
function refreshResponseTimePercentilesOverTime(fixTimestamps) {
    var infos = responseTimePercentilesOverTimeInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotResponseTimePercentilesOverTime"))) {
        infos.createGraph();
    }else {
        var choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimePercentilesOverTime", "#overviewResponseTimePercentilesOverTime");
        $('#footerResponseTimePercentilesOverTime .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var responseTimeVsRequestInfos = {
    data: {"result": {"minY": 119975.5, "minX": 1.0, "maxY": 125488.0, "series": [{"data": [[2.0, 121806.5], [1.0, 119975.5], [5.0, 125191.0], [11.0, 122490.0], [6.0, 124027.5], [3.0, 124343.0], [12.0, 125488.0], [7.0, 125427.0], [14.0, 125052.5], [30.0, 123807.5]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 30.0, "title": "Response Time Vs Request"}},
    getOptions: function() {
        return {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Response Time in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: {
                noColumns: 2,
                show: true,
                container: '#legendResponseTimeVsRequest'
            },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median response time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesResponseTimeVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotResponseTimeVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewResponseTimeVsRequest"), dataset, prepareOverviewOptions(options));

    }
};

// Response Time vs Request
function refreshResponseTimeVsRequest() {
    var infos = responseTimeVsRequestInfos;
    prepareSeries(infos.data);
    if (isGraph($("#flotResponseTimeVsRequest"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesResponseTimeVsRequest");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotResponseTimeVsRequest", "#overviewResponseTimeVsRequest");
        $('#footerResponseRimeVsRequest .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};


var latenciesVsRequestInfos = {
    data: {"result": {"minY": 119975.5, "minX": 1.0, "maxY": 125488.0, "series": [{"data": [[2.0, 121806.5], [1.0, 119975.5], [5.0, 125191.0], [11.0, 122490.0], [6.0, 124027.5], [3.0, 124343.0], [12.0, 125488.0], [7.0, 125427.0], [14.0, 125052.5], [30.0, 123807.5]], "isOverall": false, "label": "Successes", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 1000, "maxX": 30.0, "title": "Latencies Vs Request"}},
    getOptions: function() {
        return{
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true
                }
            },
            xaxis: {
                axisLabel: "Global number of requests per second",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            yaxis: {
                axisLabel: "Median Latency in ms",
                axisLabelUseCanvas: true,
                axisLabelFontSizePixels: 12,
                axisLabelFontFamily: 'Verdana, Arial',
                axisLabelPadding: 20,
            },
            legend: { noColumns: 2,show: true, container: '#legendLatencyVsRequest' },
            selection: {
                mode: 'xy'
            },
            grid: {
                hoverable: true // IMPORTANT! this is needed for tooltip to work
            },
            tooltip: true,
            tooltipOpts: {
                content: "%s : Median Latency time at %x req/s was %y ms"
            },
            colors: ["#9ACD32", "#FF6347"]
        };
    },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesLatencyVsRequest"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotLatenciesVsRequest"), dataset, options);
        // setup overview
        $.plot($("#overviewLatenciesVsRequest"), dataset, prepareOverviewOptions(options));
    }
};

// Latencies vs Request
function refreshLatenciesVsRequest() {
        var infos = latenciesVsRequestInfos;
        prepareSeries(infos.data);
        if(isGraph($("#flotLatenciesVsRequest"))){
            infos.createGraph();
        }else{
            var choiceContainer = $("#choicesLatencyVsRequest");
            createLegend(choiceContainer, infos);
            infos.createGraph();
            setGraphZoomable("#flotLatenciesVsRequest", "#overviewLatenciesVsRequest");
            $('#footerLatenciesVsRequest .legendColorBox > div').each(function(i){
                $(this).clone().prependTo(choiceContainer.find("li").eq(i));
            });
        }
};

var hitsPerSecondInfos = {
        data: {"result": {"minY": 1.6666666666666667, "minX": 1.77929778E12, "maxY": 1.6666666666666667, "series": [{"data": [[1.77929778E12, 1.6666666666666667]], "isOverall": false, "label": "hitsPerSecond", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.77929778E12, "title": "Hits Per Second"}},
        getOptions: function() {
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of hits / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendHitsPerSecond"
                },
                selection: {
                    mode : 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y.2 hits/sec"
                }
            };
        },
        createGraph: function createGraph() {
            var data = this.data;
            var dataset = prepareData(data.result.series, $("#choicesHitsPerSecond"));
            var options = this.getOptions();
            prepareOptions(options, data);
            $.plot($("#flotHitsPerSecond"), dataset, options);
            // setup overview
            $.plot($("#overviewHitsPerSecond"), dataset, prepareOverviewOptions(options));
        }
};

// Hits per second
function refreshHitsPerSecond(fixTimestamps) {
    var infos = hitsPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if (isGraph($("#flotHitsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesHitsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotHitsPerSecond", "#overviewHitsPerSecond");
        $('#footerHitsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
}

var codesPerSecondInfos = {
        data: {"result": {"minY": 1.6666666666666667, "minX": 1.7792979E12, "maxY": 1.6666666666666667, "series": [{"data": [[1.7792979E12, 1.6666666666666667]], "isOverall": false, "label": "200", "isController": false}], "supportsControllersDiscrimination": false, "granularity": 60000, "maxX": 1.7792979E12, "title": "Codes Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of responses / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendCodesPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "Number of Response Codes %s at %x was %y.2 responses / sec"
                }
            };
        },
    createGraph: function() {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesCodesPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotCodesPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewCodesPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Codes per second
function refreshCodesPerSecond(fixTimestamps) {
    var infos = codesPerSecondInfos;
    prepareSeries(infos.data);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotCodesPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesCodesPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotCodesPerSecond", "#overviewCodesPerSecond");
        $('#footerCodesPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var transactionsPerSecondInfos = {
        data: {"result": {"minY": 1.6666666666666667, "minX": 1.7792979E12, "maxY": 1.6666666666666667, "series": [{"data": [[1.7792979E12, 1.6666666666666667]], "isOverall": false, "label": "TopUsers(naive)-success", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7792979E12, "title": "Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTransactionsPerSecond"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                }
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTransactionsPerSecond"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTransactionsPerSecond"), dataset, options);
        // setup overview
        $.plot($("#overviewTransactionsPerSecond"), dataset, prepareOverviewOptions(options));
    }
};

// Transactions per second
function refreshTransactionsPerSecond(fixTimestamps) {
    var infos = transactionsPerSecondInfos;
    prepareSeries(infos.data);
    if(infos.data.result.series.length == 0) {
        setEmptyGraph("#bodyTransactionsPerSecond");
        return;
    }
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotTransactionsPerSecond"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTransactionsPerSecond");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTransactionsPerSecond", "#overviewTransactionsPerSecond");
        $('#footerTransactionsPerSecond .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

var totalTPSInfos = {
        data: {"result": {"minY": 1.6666666666666667, "minX": 1.7792979E12, "maxY": 1.6666666666666667, "series": [{"data": [[1.7792979E12, 1.6666666666666667]], "isOverall": false, "label": "Transaction-success", "isController": false}, {"data": [], "isOverall": false, "label": "Transaction-failure", "isController": false}], "supportsControllersDiscrimination": true, "granularity": 60000, "maxX": 1.7792979E12, "title": "Total Transactions Per Second"}},
        getOptions: function(){
            return {
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                xaxis: {
                    mode: "time",
                    timeformat: getTimeFormat(this.data.result.granularity),
                    axisLabel: getElapsedTimeLabel(this.data.result.granularity),
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20,
                },
                yaxis: {
                    axisLabel: "Number of transactions / sec",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 20
                },
                legend: {
                    noColumns: 2,
                    show: true,
                    container: "#legendTotalTPS"
                },
                selection: {
                    mode: 'xy'
                },
                grid: {
                    hoverable: true // IMPORTANT! this is needed for tooltip to
                                    // work
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s at %x was %y transactions / sec"
                },
                colors: ["#9ACD32", "#FF6347"]
            };
        },
    createGraph: function () {
        var data = this.data;
        var dataset = prepareData(data.result.series, $("#choicesTotalTPS"));
        var options = this.getOptions();
        prepareOptions(options, data);
        $.plot($("#flotTotalTPS"), dataset, options);
        // setup overview
        $.plot($("#overviewTotalTPS"), dataset, prepareOverviewOptions(options));
    }
};

// Total Transactions per second
function refreshTotalTPS(fixTimestamps) {
    var infos = totalTPSInfos;
    // We want to ignore seriesFilter
    prepareSeries(infos.data, false, true);
    if(fixTimestamps) {
        fixTimeStamps(infos.data.result.series, 10800000);
    }
    if(isGraph($("#flotTotalTPS"))){
        infos.createGraph();
    }else{
        var choiceContainer = $("#choicesTotalTPS");
        createLegend(choiceContainer, infos);
        infos.createGraph();
        setGraphZoomable("#flotTotalTPS", "#overviewTotalTPS");
        $('#footerTotalTPS .legendColorBox > div').each(function(i){
            $(this).clone().prependTo(choiceContainer.find("li").eq(i));
        });
    }
};

// Collapse the graph matching the specified DOM element depending the collapsed
// status
function collapse(elem, collapsed){
    if(collapsed){
        $(elem).parent().find(".fa-chevron-up").removeClass("fa-chevron-up").addClass("fa-chevron-down");
    } else {
        $(elem).parent().find(".fa-chevron-down").removeClass("fa-chevron-down").addClass("fa-chevron-up");
        if (elem.id == "bodyBytesThroughputOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshBytesThroughputOverTime(true);
            }
            document.location.href="#bytesThroughputOverTime";
        } else if (elem.id == "bodyLatenciesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesOverTime(true);
            }
            document.location.href="#latenciesOverTime";
        } else if (elem.id == "bodyCustomGraph") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCustomGraph(true);
            }
            document.location.href="#responseCustomGraph";
        } else if (elem.id == "bodyConnectTimeOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshConnectTimeOverTime(true);
            }
            document.location.href="#connectTimeOverTime";
        } else if (elem.id == "bodyResponseTimePercentilesOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimePercentilesOverTime(true);
            }
            document.location.href="#responseTimePercentilesOverTime";
        } else if (elem.id == "bodyResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeDistribution();
            }
            document.location.href="#responseTimeDistribution" ;
        } else if (elem.id == "bodySyntheticResponseTimeDistribution") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshSyntheticResponseTimeDistribution();
            }
            document.location.href="#syntheticResponseTimeDistribution" ;
        } else if (elem.id == "bodyActiveThreadsOverTime") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshActiveThreadsOverTime(true);
            }
            document.location.href="#activeThreadsOverTime";
        } else if (elem.id == "bodyTimeVsThreads") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTimeVsThreads();
            }
            document.location.href="#timeVsThreads" ;
        } else if (elem.id == "bodyCodesPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshCodesPerSecond(true);
            }
            document.location.href="#codesPerSecond";
        } else if (elem.id == "bodyTransactionsPerSecond") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTransactionsPerSecond(true);
            }
            document.location.href="#transactionsPerSecond";
        } else if (elem.id == "bodyTotalTPS") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshTotalTPS(true);
            }
            document.location.href="#totalTPS";
        } else if (elem.id == "bodyResponseTimeVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshResponseTimeVsRequest();
            }
            document.location.href="#responseTimeVsRequest";
        } else if (elem.id == "bodyLatenciesVsRequest") {
            if (isGraph($(elem).find('.flot-chart-content')) == false) {
                refreshLatenciesVsRequest();
            }
            document.location.href="#latencyVsRequest";
        }
    }
}

/*
 * Activates or deactivates all series of the specified graph (represented by id parameter)
 * depending on checked argument.
 */
function toggleAll(id, checked){
    var placeholder = document.getElementById(id);

    var cases = $(placeholder).find(':checkbox');
    cases.prop('checked', checked);
    $(cases).parent().children().children().toggleClass("legend-disabled", !checked);

    var choiceContainer;
    if ( id == "choicesBytesThroughputOverTime"){
        choiceContainer = $("#choicesBytesThroughputOverTime");
        refreshBytesThroughputOverTime(false);
    } else if(id == "choicesResponseTimesOverTime"){
        choiceContainer = $("#choicesResponseTimesOverTime");
        refreshResponseTimeOverTime(false);
    }else if(id == "choicesResponseCustomGraph"){
        choiceContainer = $("#choicesResponseCustomGraph");
        refreshCustomGraph(false);
    } else if ( id == "choicesLatenciesOverTime"){
        choiceContainer = $("#choicesLatenciesOverTime");
        refreshLatenciesOverTime(false);
    } else if ( id == "choicesConnectTimeOverTime"){
        choiceContainer = $("#choicesConnectTimeOverTime");
        refreshConnectTimeOverTime(false);
    } else if ( id == "choicesResponseTimePercentilesOverTime"){
        choiceContainer = $("#choicesResponseTimePercentilesOverTime");
        refreshResponseTimePercentilesOverTime(false);
    } else if ( id == "choicesResponseTimePercentiles"){
        choiceContainer = $("#choicesResponseTimePercentiles");
        refreshResponseTimePercentiles();
    } else if(id == "choicesActiveThreadsOverTime"){
        choiceContainer = $("#choicesActiveThreadsOverTime");
        refreshActiveThreadsOverTime(false);
    } else if ( id == "choicesTimeVsThreads"){
        choiceContainer = $("#choicesTimeVsThreads");
        refreshTimeVsThreads();
    } else if ( id == "choicesSyntheticResponseTimeDistribution"){
        choiceContainer = $("#choicesSyntheticResponseTimeDistribution");
        refreshSyntheticResponseTimeDistribution();
    } else if ( id == "choicesResponseTimeDistribution"){
        choiceContainer = $("#choicesResponseTimeDistribution");
        refreshResponseTimeDistribution();
    } else if ( id == "choicesHitsPerSecond"){
        choiceContainer = $("#choicesHitsPerSecond");
        refreshHitsPerSecond(false);
    } else if(id == "choicesCodesPerSecond"){
        choiceContainer = $("#choicesCodesPerSecond");
        refreshCodesPerSecond(false);
    } else if ( id == "choicesTransactionsPerSecond"){
        choiceContainer = $("#choicesTransactionsPerSecond");
        refreshTransactionsPerSecond(false);
    } else if ( id == "choicesTotalTPS"){
        choiceContainer = $("#choicesTotalTPS");
        refreshTotalTPS(false);
    } else if ( id == "choicesResponseTimeVsRequest"){
        choiceContainer = $("#choicesResponseTimeVsRequest");
        refreshResponseTimeVsRequest();
    } else if ( id == "choicesLatencyVsRequest"){
        choiceContainer = $("#choicesLatencyVsRequest");
        refreshLatenciesVsRequest();
    }
    var color = checked ? "black" : "#818181";
    if(choiceContainer != null) {
        choiceContainer.find("label").each(function(){
            this.style.color = color;
        });
    }
}

