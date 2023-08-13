# AQM

Air Quality Manager(AQM) is a service that regularly compare air quality of indoor with outdoor and send alert to your Fitbit Charge 5 (or mobile devices)

AQM은 라즈베리 파이와 연결된 **미세먼지 측정 센서를 이용하여 실내 공기질을 측정**하고, **공공 데이터 포털의 실외 미세먼지 데이터와 사용자의 걸음수를 이용**하여 경고 또는 제안 등의 알림을 사용자의 기기에 보내주는 **PWA** 기반의 앱 서비스입니다.

## 사용된 기술들

- react js
  - PWA(Progressive Web App)
  - web-push
  - mui
- AWS
  - lambda
  - api gateway
  - iot core (mqtt broker)
  - cloudfront, s3
- mongo DB



# 0. 실행 화면

- 초기 화면

<img src="./imgs/Untitled%208.png" alt="Untitled" style="zoom:33%;" />

→ 어플의 알림권한이 없다면 허용 요청 버튼이 나오고, fitbit 로그인을 할 수 있도록 유도합니다.

<img src="./imgs/Untitled%209.png" alt="Untitled" style="zoom:33%;" />

<img src="./imgs/Untitled%2010.png" alt="Untitled" style="zoom:50%;" />

PWA를 지원하는 웹 브라우저(크롬, 파이어폭스 등)에서도 알림 권한을 받을 수 있습니다.

→ 알림 권한을 허용하고자 한다면 허용버튼을 눌러 해당 어플리케이션의 알림을 허용시킬 수 있습니다.

 

<img src="./imgs/Untitled%2011.png" alt="Untitled" style="zoom:33%;" />

<img src="./imgs/Untitled%2012.png" alt="Untitled" style="zoom: 50%;" />

→ 알림을 허용했을 경우 `snackbar`를 보여줍니다. 만약 권한이 거절되었다면 경고 메시지를 보여줍니다.

<img src="./imgs/Untitled%2013.png" alt="Untitled" style="zoom:33%;" />

<img src="./imgs/Untitled%2014.png" alt="Untitled" style="zoom:33%;" />

→`fitbit로그인 하기` 버튼을 누르면 fitbit 로그인 페이지로 리디렉션되며 로그인을 진행하였을 경우, OAuth를 이용해 해당 계정과 어플리케이션을 연결해줍니다. 또한 이 단계에서 사용자의 fitbit데이터 접근 권한을 획득합니다.

- 어플리케이션 화면

<img src="./imgs/Untitled%2015.png" alt="Untitled" style="zoom:33%;" />

<img src="./imgs/Untitled%2016.png" alt="Untitled" style="zoom:33%;" />

→ 실시간 공기질 데이터 정보(실내, 실외)를 다양한 방법으로 보여주고, 공기질 데이터 추이 그래프를 이용하여 현재까지 저장되어있는 공기질 정보를 요약하여 보여줍니다. 또한, Fitbit API를 이용하여 로그인한 fitbit 계정의 프로필 정보와 오늘의 활동 정보를 보여줍니다.

<img src="./imgs/Untitled%2017.png" alt="Untitled" style="zoom:50%;" />

<img src="./imgs/Untitled%2018.png" alt="Untitled" style="zoom:50%;" />

→ 로그인한 사용자에 따라 fitbit정보가 달라지며, 당일의 미세먼지 수준과 사용자의 활동량에 따라 활동 추천 문구를 제공합니다.

- 알림 기능(apple watch, fitbit charge 5 등의 스마트 기기)

<img src="./imgs/Untitled%2019.png" alt="Untitled" style="zoom:33%;" />

<img src="./imgs/Untitled%201.png" alt="Untitled" style="zoom:50%;" />

<img src="./imgs/Untitled%202.png" alt="Untitled" style="zoom:50%;" />

→ AQM에서 제공해주는 푸시 알림은 핸드폰 뿐만 아니라 Fitbit, 애플워치등의 웨어러블 기기에서도 확인할 수 있습니다. <u>ios는 진동이 제공되지 않지만(현재 PWA 앱의 알림에서 ios는 진동이 불가함), 안드로이드와 fitbit은 진동으로 알림을 제공할 수도 있습니다</u>.



## 1. Introduce

- **시스템 개요**
  
    사용자는 React 기반의 웹 어플리케이션으로 라즈베리파이의 센서를 통해 수집된 실내 미세 먼지 데이터와 공공 데이터 포탈의 API로부터 수집한 외부 미세먼지 데이터를 확인할 수 있습니다.
    
    위 어플리케이션에서는 실내 공기질(센서를 통해 수집한)이 좋지 않을 때, 실외 공기질을 확인하여 문을 열거나, 공기 청정기를 틀도록 유도하는 알림을 사용자 어플리케이션에 보내고 앱과 연동된 Fitbit을 포함한 스마트 기기에서 해당 어플리케이션의 알림을 켜놓게 된다면 푸시 알림을 확인할 수 있습니다.
    
    MongoDB를 이용하여 데이터를 저장하고 이를 활용하여 실내외 데이터의 추이를 시각적으로 확인할 수 있도록 차트를 제공하고 현재 실내외 미세먼지 정보를 제공합니다.
    마지막으로, fitbit 사용자의 Oauth권한을 획득하여 사용자에 대한 fitbit data(프로필, 활동정보)을 제공합니다. 실외 대기질 데이터를 기반으로 운동량이 적은 경우, 운동이나 바깥활동을 제안합니다. 
    

## 2. 시스템 설계 및 구현

2-1. 최종 시스템 설계

- 시스템 아키텍처
  
    ![Untitled](./imgs/Untitled.png)
    
- 아키텍처 및 사용된 컴포넌트 설명
    - 데이터 수집
        - Fitbit User Data
          
            Fitbit data에 대한 oauth권한을 획득하여 access token을 이용하여 fitbit api에서 제공하는 사용자의 `활동 정보`, `프로필 정보`를 저장합니다.
            
        - Outdoor PM Data
          
            공공데이터 포탈로부터 외부 대기질 정보를 `Amazon EventBridge`의 스케쥴링 트리거를 통해 AWS 람다 함수에 등록하여 공공 데이터 포털에 rest API를 호출하여 대기질 정보를 Mongo DB에 저장하게 됩니다. 데이터는 `Nova PM Sensor` Data와 마찬가지로 미세먼지 수집 시간과 PM2.5, PM10 3가지 정보를 포함하고 있습니다. 
            
            공공 데이터 포털 정보는 라즈베리파이 센서가 있는 광진구를 기준으로 수집, 제공합니다.
            
        - Indoor PM Data : [IoT Core + Raspberry Pi]
          
            NOVA PM Sensor, Raspberry Pi를 통해 60초마다 수집한 실내 대기질 정보를 주기적으로 AWS IOT Core를 이용하여 ****Publish 하고, Lambda를 이용해서 해당 데이터를 Mongo DB에 해당 데이터를  저장합니다.  데이터는 미세먼지 수집 시간과 PM2.5, PM10 3가지 정보를 포함하고 있습니다.
            
        
    - Service - API
      
        Mongo DB에 저장되어 있는 정보를 가지고 사용자에게 api를 제공합니다.
        
        - 차트 정보 - 라즈베리파이로 수집하여 저장된 내부 미세먼지 정보, 공공데이터포탈에서 수집하여 저장된 외부미세먼지 정보를 활용하여서 차트 데이터를 제공합니다. 데이터는 최근 6시간에 대한 내외부 미세먼지 데이터를 배열로 제공합니다.
        - 현재 미세먼지 정보 - 현재 미세먼지 정보는 api호출 시점에 가장 최신의 내부미세먼지, 외부 미세먼지 데이터를 제공합니다.
        
    - Service - Notification
        - Device구독 등록 - 사용자가 앱에 알림권한을 허용하면 MongoDB에 해당 Device를 등록합니다. 이렇게 구독등록이 되면 해당 Device에 알림을 보낼 수 있게 됩니다.
        - Push Notification - IoT Core Rule에서 정의한 특정 조건이 되면 Lambda를 호출하여서 구독등록된 모든 기기에 알림을 보내게 됩니다. 현재는 라즈베리파이로 수집한 내부 미세먼지가 나쁨 수준이 되면(PM10 > 80 or PM2.5>25) 알림을 보내게 됩니다. 이 때 외부 미세먼지 상황에 따라 다른 알림을 보내게 됩니다. 만약 외부 미세먼지가 좋지 않다면 공기청정기 알림을 보내게되고, 외부 미세먼지가 좋다면 창문을 통한 환기 권유 알림을 보내게 됩니다.
          
            <img src="./imgs/Untitled%201.png" alt="Untitled" style="zoom:50%;" />
            
            <img src="./imgs/Untitled%202.png" alt="Untitled" style="zoom:50%;" />
        
    - S3 storage & CloudFront(CDN server)
        - 웹 어플리케이션을 제공하기 위해 AWS CloudFront를 이용하여 배포하였습니다. CDN서버에 정적 소스를 캐싱하여 url을 통한 request에 대하여 웹서비스를 제공합니다. OAuth와 Push 알림등의 보안적인 처리를 위해 `https` 프로토콜을 이용하도록 하였습니다.
        - React js를 빌드하여 s3 버킷에 업로드해놓고, CloudFront에서 이를 제공하는 방식으로 서비스를 제공합니다. 버킷에 올릴 때에는 build 이후에  `aws-cli`를 이용하여 사용자를 등록해놓고, `aws s3 sync` 명령어를 이용하여 cli 환경에서 업로드하였습니다. 또한 버킷의 업데이트가 일어난 경우, CDN에서 캐시를 업데이트하여 사용자가 업데이트된 화면을 제공받을 수 있도록 제공합니다.
        
    - User Interface - 사용자 인터페이스
        - React js를 이용하여 사용자 인터페이스를 제공합니다. 또한, PWA를 도입하여 모바일/PC 네이티브 어플리케이션처럼 다운받아서 사용할 수 있도록 하였습니다. 이를 통하여 어플리케이션이 실행중이 아닐 때에도 백그라운드 알림 등을 받아 사용자에게 제공할 수 있습니다. 또한, fitbit 서버에 로그인하도록 하여 사용자에 따른 기능을 제공해줄 수 있습니다.
            - 주요 라이브러리 및 기능
                - react
                  
                    함수형 컴포넌트를 제작하고, 가상 DOM과 state를 이용하여 좋은 개발 경험과 효율적인 리렌더링을 할 수 있도록 해줍니다.
                    
                - axios
                  
                    Restful Api 기반의 fetch를 간편하게 처리하기 위해 axios를 이용하였습니다.
                    
                - recoil
                  
                    로그인 상태, 토큰 등을 context에 저장해두기 위해 전역 상태 관리 라이브러리를 이용하였습니다.
                    
                - fitbit api oauth 인증
                  
                    fitbit api의 정보를 이용하기 위해 로그인을 수행하고, token을 발급받는 로직이 포함되어 있습니다.
                    
                - service worker
                  
                    백그라운드에서 알림이 왔을 때, 이를 푸시로 보여주기 위해서 service worker를 등록하여 제공합니다.
                    
                - web-push
                  
                    push 서버에 대한 구독을 등록하기 위해 serviceKey를 등록해야합니다. 푸시 서버(여기서는 람다로 구현)에서는 serviceKey, privateKey 그리고 기기의 구독 정보를 갖고 push 알림을 보낼 수 있습니다.
                    
                - mui
                  
                    UI를 효과적으로 구성하기 위해 사용하는 라이브러리입니다.
                    
                - recharts
                  
                    유연한 차트 데이터와 애니메이션 등을 보여주게 하기 위해 rechart를 이용하였습니다.
                    
        

2-2. 구현 결과(소스코드 설명)

- 시스템 구성 및 컴포넌트 구현
    1. NOVA PM Sensor & Raspberry Pi
       
        ```jsx
        ├── aws-iot-device-sdk-python-v2
        │   ├── awsiot
        │   ├── builder.json
        │   ├── codebuild
        │   ├── deviceadvisor
        │   ├── docsrc
        │   ├── documents
        │   ├── make-docs.py
        │   ├── README.md
        │   ├── samples
        │   ├── setup.cfg
        │   ├── setup.py
        │   ├── test
        │   └── utils
        ├── connect_device_package.zip
        ├── nohup.out
        ├── nova-pm-sensor.cert.pem
        ├── nova-pm-sensor-Policy
        ├── nova-pm-sensor.private.key
        ├── nova-pm-sensor.public.key
        ├── root-CA.crt
        └── start.sh
        ```
        
        aws iot core제공하는 aws-iot device sdk를 사용하여 라즈베리파이에서 AWS 클라우드 시스템으로 데이터를 전송하게 됩니다. 기본적인 의존성 설치와 mqtt publish에 대한 테스트 실행을 셸파일인 start.sh를 통해 진행할 수 있습니다.
        
        기존에 nova pm sensor를 통해 받아지는 데이터를 aws iot device sdk를 통해 iot core로 데이터를 전송했습니다. 해당 로직은 센서로부터 일정한 주기로 데이터를 받고 해당 데이터를 Publish하게 됩니다.
        
    2. IoT Core
        - Indoor Pm Store Rule
          
            ![Untitled](./imgs/Untitled%203.png)
            
            → 라즈베리에서 수집한 이후 PM10, PM2.5, 수집 시간 Json객체로 보내주기 때문에 어떠한 제약조건도 걸지 않았고 모든 수집된 데이터를 저장하기 위해 where 제약도 걸지 않았습니다.
            
        - Notification Rule
          
            ![Untitled](./imgs/Untitled%204.png)
            
            → 미세먼지 발표 등급 기준을 참고하여서 나쁨 수준에 해당하는 수집이 일어나면 Notification을 위한 Lambda를 호출하게 됩니다. Notification에 Lambda는 아래 코드와 같으며 MongoDB에 등록된 모든 device정보를 가져와서 알림을 보내게 됩니다. 이 때 외부 미세먼지 데이터(SCollection)을 가져와서 외부미세먼지가 좋지 않으면 “내부 미세먼지가 좋지 않으니 공기청정기를 틀어주세요” 알림을 보내고 외부미세먼지가 좋으면 “내부 미세먼지가 좋지 않으니 창문을 열어 환기해주세요” 알림을 보내게 됩니다. 외부 미세먼지에 대한 기준도 아래 등급기준을 따릅니다.
            
            ![Untitled](./imgs/Untitled%205.png)
            
            - Push Notification
              
                ```jsx
                const mongoose = require('mongoose');
                const MONGO_DB_IP = 'mongodb://13.125.247.254:27017/admin';
                const db = mongoose.connection;
                const webpush = require('web-push');
                
                webpush.setVapidDetails(
                  `mailto:${process.env.VAPID_MAILTO}`,
                  process.env.VAPID_PUBLIC_KEY,
                  process.env.VAPID_PRIVATE_KEY
                );
                
                module.exports.handler = async (event, context) => {
                  await mongoose.connect(MONGO_DB_IP);
                  console.log('connected!')
                
                  const subs = db.collection('subs');
                  const subs_datas = await subs.find({}, { sort: { _id: -1 } }).toArray();
                  const sc = db.collection('SCollection');
                  const sdata = await sc.findOne({}, { sort: { _id: -1 } });
                
                  for (let i in subs_datas) {
                    try{
                      const tmp = {endpoint:subs_datas[i]['endpoint'], keys:subs_datas[i]['keys'] };
                      console.log(tmp);
                      if((1*sdata.pm10)>81){
                        await pushFunc(tmp,'미세먼지 환기 알림', '내부 미세먼지가 좋지 않으니 공기청정기를 틀어주세요');
                      }else {
                        await pushFunc(tmp,'미세먼지 농도 알림', '내부 미세먼지가 좋지 않으니 창문을 열어 환기해주세요');
                      }
                      
                    }catch(err) {
                      console.error('유효하지 않은 구독자입니다.', err);
                    }
                  }
                
                  const jsonString = JSON.stringify(subs_datas).replace(/\//g, '');
                  const response = {
                    statusCode: 200,
                    body: jsonString,
                  };
                  return response;
                };
                ```
        
    3. Lambda
       
        길이가 너무 길어져 함수의 주요 기능만 첨부하며, 실제 코드는 try… catch 등으로 DB connection, lambda call에 대한 예외등이 처리되어있습니다.
        
        - 외부공기 데이터 저장
        
        ```jsx
        //api key, axios, mongodb configuration
        
        module.exports.handler = async (event, context) => {
          await mongoose.connect(MONGO_DB_IP);
          console.log('connected!');
          
        	// url 및 query param
         var url = 'http://apis.data.go.kr/...
         var queryParams = '?' + encodeURIComponent('serviceKey...
        
        // axios를 통해 미세먼지 데이터 수집
          await axios.get(url + queryParams)
              .then(async response => {
                  recent_data = response.data.response.body.items[0]
                  pm10 = recent_data["pm10Value"]
                  pm25 = recent_data["pm25Value"]
        
                  "pm25" : "${pm25}", "time" : "${currentTime}"}`)
                  coll = db.collection('SCollection');
        
        					// mongodb에 데이터 저장
                  await coll.insertOne(data....
              })
              .catch(error => {
                  console.log(error)
              });
        }
        ```
        
        → 공공 데이터 포털에서 제공해주는 api 정보 데이터를 받아오기 위해 url과 parameter를  설정해주고 미세먼지 농도, 초미세먼지 농도, 수집된 시간 정보를 받아와서 데이터베이스에 저장합니다.
        
        - 내부공기 데이터 저장
        
        ![Untitled](./imgs/Untitled%206.png)
        
        ```jsx
        // mongo db configuration
        const mongoose = require('mongoose');
        const MONGO_DB_IP... // mongodb end point설정
        const db = mongoose.connection;
        
        // lambda 이벤트 핸들러
        module.exports.handler = async (event, context) => {
        
        // mongo db 연결
          await mongoose.connect...
          console.log('connected!');
          const col = db.collection('AQCollection');
        
        	// mongo db 저장
          await col.insertOne(event, function (err, result) ... 
        };
        ```
        
        → 먼저 IoT Core에서 데이터가 수집되는 시점에 람다함수를 호출합니다 이후 호출된 람다함수에서는 Mongo DB에 해당 실내 미세먼지 데이터를 저장합니다.
        
        - fitbit 사용자 데이터 저장
        
        ```jsx
        module.exports.handler = async(event, context) => {
          // TODO implement
          var userInfo;
          var activityInfo;
          userInfo = await getUserinfo(event.accessToken, event.userId);
          activityInfo = await getActivity(event.accessToken, event.userId);
        
          const response = {
              statusCode: 200,
              userInfo: userInfo,
              activityInfo : activityInfo
          };
          return response;
        };
        
        const getUserinfo = async (accessToken, userId) => {
            var info;
            await client.get(
              "/profile.json",
              accessToken,
              userId
            ).then(result => {
              info = result[0]["user"]
            });
        };
        
        const getActivity = async (accessToken,userId ) => {
            var info;
            await client.get(
              `/activities/date/${today}.json`,
              accessToken,
              userId
            ).then(result => {
              info = result[0]["summary"]
            });
          }
        };
        ```
        
        → 애플리케이션에서 OAuth인증을 통해 획득한 accessToken과 userId를 이용하여 fitbit web api서버로부터 해당 사용자의 프로필 정보와 오늘의 활동 정보를 받아와 Response로 전달해줍니다.
        
    4. API Gateway + Lambda
        - Chart - GET
          
            ```jsx
            module.exports.handler = async (event, context) => {
              await mongoose.connect(MONGO_DB_IP);
              console.log('connected!');
              
            	// mongo db로 부터 6시간 전 미세먼지 데이터를 1시간 단위로 불러와 배열에 저장
              const outdoor = await getOuterPM();
              const indoor = await getInnerPM();
              
              const ret = 
                {
                    outdoor : {
                        pm25:outdoor.outdoor_pm25,
                        pm10:outdoor.outdoor_pm10,
                        time:outdoor.time
                    },
                    indoor : {
                        pm25:indoor.indoor_pm25,
                        pm10:indoor.indoor_pm10,
                        time:outdoor.time
                    }
                }
              const response = {
                statusCode: 200,
                body: jsonString,
            };
            return response;
            };
            ```
            
            → 내외부 미세먼지 데이터를 mongo DB로 부터 불러옵니다.
            
            이후 현재 시간으로 부터 6시간 전데이터 까지의 데이터를 1시간 단위로 가져와 배열에 저장하여서 Response하게 됩니다.
            
        - Current PM - GET
          
            ```jsx
            module.exports.handler = async (event, context) => {
              await mongoose.connect(MONGO_DB_IP);
              console.log('connected!');
              
              const aq_collection = db.collection('AQCollection');
              const seooul_collection = db.collection('SCollection');
            
              // MongoDB에 수집된 데이터 중 가장 최신 데이터를 가져온다.
              const indoor = await aq_collection.findOne({}, { sort: { _id: -1 } });
              const outdoor = await seooul_collection.findOne({}, { sort: { _id: -1 } });
              
              const ret = {indoor,outdoor}
              const jsonString = JSON.stringify(ret).replace(/\//g, '');
              const response = {
                statusCode: 200,
                body: jsonString,
            
                
                };
                return response;
            };
            ```
            
            → 수집된 데이터 중 가장 최신의 내부, 외부 미세먼지 데이터를 가져와 리턴합니다.
            
        - Fitbit oauth - GET
          
            ```jsx
            const FitbitApiClient = require('fitbit-node');
            const client = new FitbitApiClient({ clientId: process.env.client_id, clientSecret: process.env.client_secret, apiVersion: "1.2" });
            const redirect_url = 'https://d1ibyvw0m8j8h9.cloudfront.net';
            const getAuthorizeUrl = async () => {
              var url = null;
              try {
                url = await client.getAuthorizeUrl("activity location profile", redirect_url);
                console.log('Authorization URL:', decodeURIComponent(url));
              } catch (error) {
                throw error;
              }
              return decodeURIComponent(url);
            };
            
            module.exports.handler = async (event, context) => {
              var url = null;
              try{
                url = await getAuthorizeUrl();
              }catch(error) {
                console.error('Error occurred while getting the authorization URL:', error);
              }
              const response = {
                statusCode: 200,
                body: url,
              }; 
              return response;
            ```
            
            → fitbit oauth에 대한 과정은 fitbit-node라는 라이브러리를 활용하였습니다. 이를 활용하여 사용자에게 Authorization URL을 제공합니다. 제공할 때는 프론트에 대한 Redirect가 함께 제공되며 사용자가 인증 인가를 마치고 Redirection될 때 code라는 인가 코드를 얻게 됩니다. 이후 해당 code를 가지고 accesstoken을 요청하게 됩니다.
            
            [fitbit-node - npm (npmjs.com)](https://www.npmjs.com/package/fitbit-node)
            
        - Fitbit accesstoken - POST
          
            ```jsx
            const getAccessToken = async (code) => {
              var auth = null;
              try {
                auth = await client.getAccessToken(code, redirect_url);
                console.log('Authorization URL1:', auth);
              } catch (error) { 
                console.error('Error occurred while getting the authorization URL1:', error);
              }
              return auth;
            };
            
            module.exports.handler = async (event, context) => {
              await mongoose.connect(MONGO_DB_IP);
            
             // 사용자가 POST로 보낸 "code" 값 가져오기
             const code = event.code;
              var auth = null;
              try{
                auth = await getAccessToken(code);
              }catch(error) {
                console.error('Error occurred while getting the authorization URL2:', error);
              }
              console.log(auth);
              const accessToken = auth['access_token']
            
              // const jsonString = JSON.stringify(url).replace(/\//g, '');
              const response = {
                statusCode: 200,
                accessToken: accessToken
              }; 
              return response;
            };
            ```
            
            → 사용자가 Autorize URL을 통해 인증을 완료하게 되면 code로 accessToken을 요청하게 됩니다. 해당 code가 유효하다면 fitbit server에서 해당 유저에 대한 accessToken을 반환하여 응답합니다. 
            
            이 역시 fitbit-node 라이브러리를 활용하였습니다.
            
            [fitbit-node - npm (npmjs.com)](https://www.npmjs.com/package/fitbit-node)
            
        - Notification Register - POST
          
            ```jsx
            const mongoose = require('mongoose');
            const MONGO_DB_IP = 'mongodb://13.125.247.254:27017/admin';
            const db = mongoose.connection;
            
            module.exports.handler = async (event, context) => {
              await mongoose.connect(MONGO_DB_IP);
              console.log('connected!')
            
              const body = event['body-json'];
              
              coll = db.collection('subs');
              await coll.insertOne(body, function (err, result) {
                  if (err) throw err;
                  console.log('Saved to MongoDB:', body);
              });
            
              const jsonString = JSON.stringify(body).replace(/\//g, '');
              const response = {
                statusCode: 200,
                body: jsonString,
              };
              return response;
            };
            ```
            
            → Device에서 보내는 device에 대한 context정보를 Mongo DB에 저장하게 됩니다. 디바이스 정보는 endpoint, key가 있으며 해당 정보를 Front에서 요청하게 됩니다.
            
            ![Untitled](./imgs/Untitled%207.png)
        
    5. 사용자 인터페이스
        - 디렉토리 구조
          
            ```jsx
            .
            ├── build
            │   ├── aqm-icon.png
            │   ├── asset-manifest.json
            │   ├── index.html
            │   ├── iphonex_splash.png
            │   ├── manifest.json
            │   ├── robots.txt
            │   ├── service-worker.js
            │   └── static
            ├── package-lock.json
            ├── package.json
            ├── public
            │   ├── aqm-icon.png
            │   ├── index.html
            │   ├── iphonex_splash.png
            │   ├── manifest.json
            │   ├── robots.txt
            │   └── service-worker.js
            └── src
                ├── App.css
                ├── App.js
                ├── GradientBar.js
                ├── MainPage.js
                ├── constants.js
                ├── index.css
                ├── index.js
                ├── recoil.js
                └── util.js
            ```
            
            `PWA` 기반의 `React Web app`으로, api 요청은 `axios`를 통하여 AWS 람다로 보내며, `service-worker.js`를 통하여 푸시 알림을 전달받을 수 있습니다.
            
        - 알림 권한 받고, lambda call하여 기기 정보 등록
          
            ```jsx
            		const registration = await navigator.serviceWorker.register('service-worker.js', {
                  scope: './',
                });
            		const result = await Notification.requestPermission();
                if (result === 'granted') {
            			// subscribe push servcer
                  const subscription = await registration.pushManager.subscribe({
                    applicationServerKey: process.env.REACT_APP_PUBLIC_KEY,
                    userVisibleOnly: true,
                  });
            			//call lambda (to save device)
                  await fetch('https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/subs', {
                    method: 'post',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(subscription),
                  });
            ```
            
            알림을 처리하기 위해, 우선 service-worker를 등록합니다. 또한, `Notification api`에서 제공하는 requestPermission() 함수로 명시적으로 native device의 권한을 받습니다. 권한을 허용받았다면, push 서버를 구독하도록 합니다. 이는 `web-push` 모듈을 이용하여 발급받은 서버의 serviceKey를 입력합니다. 이후, lambda 함수를 호출하여 기기의 구독 정보를 저장합니다.
            
            구독 정보는 mongodb에 다음과 같이 저장됩니다. end_point는 기기에 알림을 보낼 수 있는 제공자 서버의 주소입니다.(ios의 경우 web.push.apple~ chrome의 경우 fcm.googleapis.~ 등) 또한 keys에는 기기의 key 값과 서명 정보가 들어가 있습니다. 푸시 알림 제공자 서버는 key값과 서버의 요청을 기반으로 적절한 요청인지를 판단하고 기기에 알림을 보내게 됩니다.
            
            ![Untitled](./imgs/Untitled%207.png)
            
        - service worker에서 백그라운드 알림 처리
          
            ```jsx
            self.addEventListener('push', function (event) {
              if (!(self.Notification && self.Notification.permission === 'granted')) {
                return;
              }
              // 푸시 알림 데이터 파싱
              var pushData = {};
              if (event.data) {
                pushData = event.data.json();
              }
              console.log(pushData);
              // 푸시 알림 옵션 구성
              var options = {
                body: pushData.body,
              };
            
              // 알림 생성
              self.registration.showNotification(pushData.title, options);
            });
            ```
            
            푸시 서버에서 push 알림이 도착하면, 백그라운드에서 실행중인 service worker가 이를 listen하고, title과 body를 사용자에게 푸시 알림으로 제공합니다.
            
        - fitbit 소셜 로그인 하여 토큰 정보 저장
          
            ```jsx
            const requestRedirect = async () => {
                const { data } = await axios.get(
                  'https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/fitbit'
                );
                const redirect_url = data?.body;
                window.location.href = redirect_url;
              };
              const requestLogin = async (code) => {
                const { data } = await axios.post(
                  'https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/fitbit',
                  { code }
                );
                const tokenReceived = {
                  accessToken: data?.accessToken,
                  refreshToken: data?.refreshToken,
                  userId: data?.userId,
                };
                setToken(tokenReceived);
                setAuth(true);
              };
            ```
            
            fitbit api에 로그인하기 위해, 람다 함수를 호출합니다. 람다에서는 fitbit 인증 서버를 통하여 클라이언트 브라우저를 로그인 창으로 redirect 시켜줍니다. 로그인이 성공한다면 fitbit api에서 사용자 정보를 포함한 token 정보를 람다에서부터 전달 받습니다. 이를 전역 상태인 recoil state로 설정하고 로그인 처리를 하여 사용자에게 메인 페이지를 보여주도록 할 수 있습니다.
            
        - 실내외 현재/차트 데이터 받아오기
          
            ```jsx
            const [chart, current] = await axios.all([
                    axios.get('~amazonaws.com/aq/chart'),
                    axios.get('~amazonaws.com/aq/get_pm'),
                  ]);
            ...
            useEffect(() => {
                const fetchData = async () => {
                  try {
                    ... fetch 관련 로직
                    
                  } catch (error) {
                    console.log('API 요청 실패:', error);
                  }
                };
                fetchData();
                const interval = setInterval(fetchData, 1000 * 60); //1분마다 요청
            
                // 컴포넌트 언마운트 시 clearInterval을 통해 타이머 제거
                return () => clearInterval(interval);
              }, []);
            ```
            
            람다로부터 최근 미세먼지 데이터와 현재 실내외 데이터를 한번에 가져오기 위해 `axios.all([])` 함수를 이용하였습니다. 상황에 따라 주기적으로 데이터를 갱신할 필요가 있는 경우에는 주기적으로 fetch를 수행할 수 있습니다. 실내외 공기질 데이터와 차트에 필요한 데이터를 가져와 UI를 구성하였습니다.
            
        - fitbit 사용자 데이터 받아오기
          
            ```jsx
            const fetchFitbitData = async (token) => {
                if (token) {
                  const { data } = await axios.post(
                    'https://lccxa9jaxk.execute-api.ap-southeast-2.amazonaws.com/aq/fitbit_api',
                    {
                      accessToken: token.accessToken,
                      userId: token.userId,
                    }
                  );
                  setFitbitInfo(data);
                }
              };
            ...
            useEffect(() => {
                fetchFitbitData(token);
              }, [token]);
            ```
            
            메인 페이지에 진입하면, useEffect로 token 데이터를 갖고 람다를 호출하여 사용자의 데이터를 가져옵니다. 람다에서는 accessToken과 userId를 이용하여 해당 날짜의 사용자의 활동 데이터를 제공해줍니다. 이를 화면에 보여주도록 합니다.
            
        - 피드백 제공
          
            ```jsx
            {airQuality.outdoor.pm10 < 30 && (
              <Typography align="center" m={1} color="#3f51b5" fontWeight={600}>
                "오늘은 날이 좋으니 밖에 나가보아요"
              </Typography>
            )}
            {airQuality.outdoor.pm10 > 30 && airQuality.outdoor.pm10 < 80 && (
              <Typography align="center" m={1} color="#8bc34a" fontWeight={600}>
                "오늘은 날이 보통이에요!"
              </Typography>
            )}
            {airQuality.outdoor.pm10 > 80 && airQuality.outdoor.pm10 < 150 && (
              <Typography align="center" m={1} color="#ffc400" fontWeight={600}>
                오늘은 미세먼지가 나쁨이니 나갈때 마스크를 착용해주세요
              </Typography>
            )}
            {airQuality.outdoor.pm10 > 150 && (
              <Typography align="center" m={1} color="#a31545" fontWeight={600}>
                오늘은 미세먼지가 매우 나쁘니 바깥 활동을 자제해주세요
              </Typography>
            )}
            ```
            
            사용자의 운동 상태와 실외 미세먼지를 데이터를 기반으로 사용자에게 피드백을 제공하도록 합니다. 문구의 경고 수준별로 다르게 보이도록 합니다.
            

2-3. 서비스 설명(구현완료 된 서비스와 완료되지 않은 서비스)

| 서비스 설명 | 사용된 기술 | 구현 완료 여부 |
| --- | --- | --- |
| Rasberry Pi 데이터 수집 및 저장(Nova PM Sensor) | AWS Lambda, AWS Iot Core, Mongo DB | O |
| 외부 미세먼지 데이터 수집(공공 데이터 포탈) | AWS Lambda, Mongo DB | O |
| Fitbit 사용자 정보 가져오기 | Fitbit Web API, Mongo DB, OAuth2 | O |
| 사용자 앱 인터페이스 제공 | React, Restful API형식 제공(axios), Amazon API Gateway, Amazon CloudFront, Amazon S3 storage | O |
| 사용자 앱 알림 제공 | Browser Notification api, PWA(service worker/ manifest.json) | O |

