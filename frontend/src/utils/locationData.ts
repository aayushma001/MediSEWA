export interface LocationData {
    [province: string]: {
        [district: string]: string[]; // Array of cities/municipalities
    };
}

export const locationData: LocationData = {
    "Koshi Province": {
        "Bhojpur": ["Bhojpur", "Shadananda"],
        "Dhankuta": ["Dhankuta", "Pakhribas", "Mahalaxmi"],
        "Ilam": ["Ilam", "Deumai", "Mai", "Suryodaya"],
        "Jhapa": ["Birtamod", "Damak", "Mechinagar", "Bhadrapur", "Arjundhara", "Kankai", "Shivasatakshi", "Gauradaha"],
        "Khotang": ["Diktel Rupakot Majhuwagadhi", "Halesi Tuwachung"],
        "Morang": ["Biratnagar", "Belbari", "Letang", "Pathari Sanischare", "Rangeli", "Sundarharaincha", "Urlabari", "Ratuwamai", "Sunwirshi"],
        "Okhaldhunga": ["Siddhicharan"],
        "Panchthar": ["Phidim"],
        "Sankhuwasabha": ["Khandbari", "Chainpur", "Dharmadevi", "Madi", "Panchkhapan"],
        "Solukhumbu": ["Solududhkunda"],
        "Sunsari": ["Itahari", "Dharan", "Inaruwa", "Duhabi", "Ramdhuni", "Barahachhetra"],
        "Taplejung": ["Phungling"],
        "Terhathum": ["Myanglung", "Laligurans"],
        "Udayapur": ["Triyuga", "Katari", "Chaudandigadhi", "Belaka"]
    },
    "Madhesh Province": {
        "Bara": ["Kalaiya", "Jitpur Simara", "Kolhabi", "Nijgadh", "Mahagadhimai", "Simraungadh", "Pacharauta"],
        "Dhanusha": ["Janakpurdham", "Chhireshwarnath", "Ganeshman Charnath", "Dhanusadham", "Mithila", "Sabaila", "Nagarain", "Videha", "Hansapur", "Kamala", "Mithila Bihari", "Sahidnagar"],
        "Mahottari": ["Jaleshwar", "Bardibas", "Gaushala", "Lahan", "Matihani", "Ramgopalpur", "Manara Shishi", "Bhangaha", "Balawa", "Aurahi"],
        "Parsa": ["Birgunj", "Pokhariya", "Bahudarmai", "Parsagadhi"],
        "Rautahat": ["Gaur", "Rajpur", "Madhav Narayan", "Katahariya", "Gadhimai", "Garuda", "Gujara", "Dewahi Gonahi", "Brindaban", "Chandrapur", "Paroha", "Maulapur", "Baudhimai", "Ishanath", "Rajdevi", "Fatuwa Vijayapur"],
        "Saptari": ["Rajbiraj", "Kanchanrup", "Dakneshwori", "Bodebarsain", "Khadak", "Shambhunath", "Surunga", "Hanumannagar Kankalini", "Saptakoshi"],
        "Sarlahi": ["Malangawa", "Barahathwa", "Hariwan", "Ishwarpur", "Lalbandi", "Bagmati", "Balara", "Godaita", "Haripur", "Haripurwa", "Kabilasi"],
        "Siraha": ["Siraha", "Lahan", "Dhangadhimai", "Golbazar", "Mirchaiya", "Karjanha", "Kalyanpur", "Sukhipur"]
    },
    "Bagmati Province": {
        "Bhaktapur": ["Bhaktapur", "Changunarayan", "Madhyapur Thimi", "Suryabinayak"],
        "Chitwan": ["Bharatpur", "Kalika", "Khairahani", "Madi", "Ratnanagar", "Rapti", "Ichchhakamana"],
        "Dhading": ["Dhunibesi", "Nilkantha"],
        "Dolakha": ["Bhimeshwor", "Jiri"],
        "Kathmandu": ["Kathmandu", "Budhanilkantha", "Chandragiri", "Dakshinkali", "Gokarneshwor", "Kageshwori Manohara", "Kirtipur", "Nagarjun", "Shankharapur", "Tarakeshwar", "Tokha"],
        "Kavrepalanchok": ["Dhulikhel", "Banepa", "Panauti", "Panchkhal", "Namobuddha", "Mandandeupur"],
        "Lalitpur": ["Lalitpur", "Godawari", "Mahalaxmi"],
        "Makwanpur": ["Hetauda", "Thaha"],
        "Nuwakot": ["Bidur", "Belkotgadhi"],
        "Ramechhap": ["Manthali", "Ramechhap"],
        "Rasuwa": ["Gosaikunda", "Kalika", "Naukunda", "Parbakunda", "Uttargaya"],
        "Sindhuli": ["Kamalamai", "Dudhouli"],
        "Sindhupalchok": ["Chautara Sangachokgadhi", "Bahrabise", "Melamchi"]
    },
    "Gandaki Province": {
        "Baglung": ["Baglung", "Galkot", "Jaimuni", "Dhorpatan"],
        "Gorkha": ["Gorkha", "Palungtar"],
        "Kaski": ["Pokhara"],
        "Lamjung": ["Besisahar", "Madhya Nepal", "Rainas", "Sundarbazar"],
        "Manang": ["Chame"],
        "Mustang": ["Gharpajhong"],
        "Myagdi": ["Beni"],
        "Nawalparasi (East)": ["Kawasoti", "Gaindakot", "Devchuli", "Madhyabindu"],
        "Parbat": ["Kushma", "Phalebas"],
        "Syangja": ["Putalibazar", "Waling", "Chapakot", "Bheerkot", "Galyang"],
        "Tanahun": ["Damauli", "Byas", "Bhanu", "Shuklagandaki", "Bhimad"]
    },
    "Lumbini Province": {
        "Arghakhanchi": ["Sandhikharka", "Sitganga", "Bhumikasthan"],
        "Banke": ["Nepalgunj", "Kohalpur"],
        "Bardiya": ["Gulariya", "Rajapur", "Madhuwan", "Thakurbaba", "Basgadhi", "Barbardiya"],
        "Dang": ["Ghorahi", "Tulsipur", "Lamahi"],
        "Gulmi": ["Musikot", "Resunga"],
        "Kapilvastu": ["Kapilvastu", "Banganga", "Buddhabhumi", "Shivaraj", "Krishnanagar", "Maharajgunj"],
        "Nawalparasi (West)": ["Ramgram", "Sunwal", "Bardaghat"],
        "Palpa": ["Tansen", "Rampur"],
        "Pyuthan": ["Pyuthan", "Swargadwari"],
        "Rolpa": ["Rolpa"],
        "Rukum (East)": ["Sist"],
        "Rupandehi": ["Butwal", "Siddharthanagar", "Tilottama", "Sainamaina", "Devdaha", "Lumbini Sanskritik"]
    },
    "Karnali Province": {
        "Dailekh": ["Narayan", "Dullu", "Chamunda Bindrasaini", "Aathbis"],
        "Dolpa": ["Thuli Bheri", "Tripurasundari"],
        "Humla": ["Simikot"],
        "Jajarkot": ["Bheri", "Chhedagad", "Nalgad"],
        "Jumla": ["Chandannath"],
        "Kalikot": ["Khandachakra", "Raskot", "Tilagufa"],
        "Mugu": ["Chhayanath Rara"],
        "Rukum (West)": ["Musikot", "Chaurjahari", "Aathbiskot"],
        "Salyan": ["Shaarda", "Bagchaur", "Bangad Kupinde"],
        "Surkhet": ["Birendranagar", "Gurbhakot", "Bheriganga", "Panchapuri", "Lekbeshi"]
    },
    "Sudurpashchim Province": {
        "Achham": ["Mangalsen", "Sanphebagar", "Panchadeval Binayak", "Kamalbazar"],
        "Baitadi": ["Dasharathchand", "Patan", "Melauli", "Purchaudi"],
        "Bajhang": ["Jayaprithvi", "Bungal"],
        "Bajura": ["Badimalika", "Triveni", "Budhiganga", "Budhinanda"],
        "Dadeldhura": ["Amargadhi", "Parshuram"],
        "Darchula": ["Mahakali", "Shailya Shikhar"],
        "Doti": ["Dipayal Silgadhi", "Shikhar"],
        "Kailali": ["Dhangadhi", "Tikapur", "Ghodaghodi", "Lamki Chuha", "Bhajani", "Godawari", "Gauriganga"],
        "Kanchanpur": ["Bhimdatta", "Punarbas", "Bedkot", "Mahakali", "Shuklaphanta", "Belauri", "Krishnapur"]
    }
};
