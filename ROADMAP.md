# EduBoard: Qo'shilishi kerak bo'lgan funksiyalar

Quyidagi ro'yxatda loyihada hozircha mavjud bo'lmagan yoki backend/API tomonidan to'liq qo'llab-quvvatlanmayotgan imkoniyatlar keltirilgan. Endpointlar yangi backend imkoniyatlari uchun taklif; mavjud endpointlarni takrorlamaydi.

## 1. Vazifaga fayl yuklash va topshirish tarixi

Hozirgi topshirish jarayonini fayl biriktirish bilan to'ldirish:
- PDF, DOCX, ZIP va rasm fayllarini yuklash
- fayl turi va hajmini serverda tekshirish
- talaba topshirgan fayllarni ko'rishi va qayta topshirishi
- kech topshirilganini serverda aniqlash
- o'qituvchiga topshirilgan faylni yuklab olish
- qayta topshirishlar tarixini saqlash

### Yangi backend endpointlari

| Method | Endpoint | Vazifasi |
|---|---|---|
| `POST` | `/object/{object_id}/submission-files` | Vazifa uchun faylni multipart orqali yuklash va topshirish |
| `GET` | `/object/{object_id}/my-submission` | Joriy talabaning topshirig'i va holatini olish |
| `GET` | `/submissions/{submission_id}/history` | Topshiriqning avvalgi versiyalarini olish |
| `GET` | `/submissions/{submission_id}/files/{file_id}` | Topshirilgan faylni xavfsiz yuklab olish |

`POST` so'rovida `file` maydoni yuboriladi. Javobda `submission_id`, `file_id`, `submitted_at`, `is_late`, `status` qaytariladi. Baholash uchun mavjud grading endpointiga rubric mezonlari va izohlar qo'shilishi mumkin.

## 2. Kurs va dars materiallari kutubxonasi

Kurs yoki darsga alohida o'quv materiallari qo'shish:
- PDF, rasm, prezentatsiya va video havolalarini biriktirish
- material nomi va tavsifini saqlash
- o'qituvchi materialni o'zgartirishi yoki o'chirishi
- talaba kurs/dars doirasida materiallarni ko'rishi va yuklab olishi

### Yangi backend endpointlari

| Method | Endpoint | Vazifasi |
|---|---|---|
| `GET` | `/lessons/{lesson_id}/materials` | Dars materiallari ro'yxati |
| `POST` | `/lessons/{lesson_id}/materials` | Darsga fayl yoki havola qo'shish |
| `PATCH` | `/materials/{material_id}` | Material nomi/tavsifini tahrirlash |
| `DELETE` | `/materials/{material_id}` | Materialni o'chirish |
| `GET` | `/materials/{material_id}/download` | Materialni xavfsiz yuklab olish |

`POST` endpointi `multipart/form-data` faylini yoki `url`, `title`, `description` maydonlarini qabul qilishi kerak.

## 3. Dars progressini saqlash

Talabaning darsni ko'rgan yoki tugatgan holatini saqlash:
- darsni tugallangan deb belgilash
- kurs bo'yicha tugallangan darslar sonini ko'rsatish
- oxirgi ko'rilgan darsni eslab qolish
- o'qituvchiga guruh progressini ko'rsatish

### Yangi backend endpointlari

| Method | Endpoint | Vazifasi |
|---|---|---|
| `GET` | `/me/courses/{group_id}/progress` | Joriy talabaning kurs progressi |
| `PUT` | `/lessons/{lesson_id}/progress` | Darsni tugallangan/tugallanmagan deb belgilash |
| `GET` | `/groups/{group_id}/progress` | Guruhdagi talabalar progressi; faqat shu guruh o'qituvchisi |

Progress foizi serverda hisoblanishi kerak; mijoz yuborgan foizga ishonilmasin.

## 4. Kurs muhokamasi va savol-javob

Kurs yoki dars ichida o'qituvchi va talabalar uchun yozishma-muhokama:
- mavzu ochish va javob yozish
- javoblarni tahrirlash/o'chirish (muallif yoki admin)
- o'qituvchi savolni hal qilingan deb belgilashi
- sahifalash va yangi javoblar haqida bildirishnoma

### Yangi backend endpointlari

| Method | Endpoint | Vazifasi |
|---|---|---|
| `GET` | `/groups/{group_id}/discussions` | Kurs muhokamalarini sahifalab olish |
| `POST` | `/groups/{group_id}/discussions` | Yangi mavzu/savol ochish |
| `GET` | `/discussions/{discussion_id}` | Bitta mavzu va javoblarini olish |
| `POST` | `/discussions/{discussion_id}/replies` | Mavzuga javob yozish |
| `PATCH` | `/discussions/{discussion_id}` | Mavzuni tahrirlash yoki hal qilingan deb belgilash |
| `DELETE` | `/discussions/{discussion_id}` | Mavzuni o'chirish |
| `PATCH` | `/discussion-replies/{reply_id}` | Javobni tahrirlash |
| `DELETE` | `/discussion-replies/{reply_id}` | Javobni o'chirish |

## 5. Admin boshqaruv paneli

Admin roli va admin interfeysi alohida qo'shilishi kerak:
- foydalanuvchilarni qidirish va sahifalash
- akkauntni vaqtincha bloklash/ochish
- foydalanuvchi rolini boshqarish
- tizimdagi kurslar va faollik bo'yicha jamlanma statistika
- muhim admin amallarini audit logga yozish

### Yangi backend endpointlari

| Method | Endpoint | Vazifasi |
|---|---|---|
| `GET` | `/admin/users` | Filter va pagination bilan foydalanuvchilar |
| `PATCH` | `/admin/users/{user_id}/status` | Akkauntni bloklash yoki faollashtirish |
| `PATCH` | `/admin/users/{user_id}/role` | Ruxsatli rollar orasida rolni o'zgartirish |
| `GET` | `/admin/overview` | Tizim bo'yicha jamlanma statistika |
| `GET` | `/admin/audit-logs` | Admin amallari tarixi |

Bu endpointlarning barchasi serverda admin rolini tekshirishi kerak. Rolni oddiy foydalanuvchi o'zi o'zgartira olmasligi shart.

## 6. Email va push orqali xabar berish

Ilova ichidagi notificationlardan tashqari:
- yangi vazifa, baho yoki muhim kurs xabari uchun email
- foydalanuvchi xabar turlarini yoqib/o'chirishi
- push xabar yuborish uchun browser subscription saqlash

### Yangi backend endpointlari

| Method | Endpoint | Vazifasi |
|---|---|---|
| `GET` | `/me/notification-preferences` | Joriy sozlamalarni olish |
| `PATCH` | `/me/notification-preferences` | Email/push xabar sozlamalarini o'zgartirish |
| `POST` | `/me/push-subscriptions` | Browser push subscription qo'shish |
| `DELETE` | `/me/push-subscriptions` | Joriy browser subscriptionni bekor qilish |

Xabar yuborish amallari backenddagi eventlar orqali bajarilsin; frontend o'zi boshqa foydalanuvchiga xabar yuborish huquqini belgilamasin.

## 7. Backend API uchun umumiy talablar

- Barcha yangi endpointlarda autentifikatsiya va role-based authorization bo'lishi kerak.
- Foydalanuvchi faqat o'ziga tegishli yoki o'zi o'qitadigan guruh ma'lumotlarini ko'rsin.
- Ro'yxat endpointlari `skip`/`limit` yoki `page`/`page_size` orqali sahifalansin.
- Fayl turlari, maksimal hajmi va saqlash muddati backendda belgilanib tekshirilsin.
- Xatolar bir xil JSON formatida qaytarilsin: `detail`, kerak bo'lsa maydon xatolari bilan.
- Muhim yozuvlar va rol o'zgarishlari audit logga yozilsin.

## Tavsiya etilgan qo'shish tartibi

1. Vazifaga fayl topshirish va topshirish tarixi
2. Dars materiallari kutubxonasi
3. Dars progressini saqlash
4. Kurs muhokamasi va savol-javob
5. Admin paneli va audit loglar
6. Email/push xabarlari
