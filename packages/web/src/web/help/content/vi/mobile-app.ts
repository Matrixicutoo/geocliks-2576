import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "Ứng dụng di động",
  summary: "Chụp ảnh và quay video có hình mờ trên iPhone, iPad hoặc Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "Chụp",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Đăng nhập trên điện thoại",
          summary: "Vào ứng dụng và chọn không gian làm việc bạn đang chụp cho.",
          keywords: ["đăng nhập", "không gian làm việc", "chuyển", "login", "sign in", "workspace", "switch"],
          body: [
            p(
              "Đăng nhập bằng cùng email và mật khẩu bạn dùng trên trang web, hoặc bằng Google nếu bạn đã đăng ký theo cách đó.",
            ),
            h("Nếu bạn thuộc nhiều không gian làm việc"),
            p(
              "Ảnh bạn chụp luôn vào không gian làm việc đang mở. Hãy kiểm tra tên không gian làm việc ở đầu màn hình trước khi bắt đầu chụp — một ảnh vào nhầm không gian làm việc thì phải xóa đi và chụp lại.",
            ),
            steps(
              "Chạm vào ảnh đại diện của bạn ở góc trên.",
              "Chọn không gian làm việc bạn muốn.",
              "Danh sách dự án tải lại cho không gian làm việc đó.",
            ),
            h("Duy trì trạng thái đăng nhập"),
            p(
              "Ứng dụng giữ bạn ở trạng thái đã đăng nhập. Nó không đăng xuất bạn khi mất sóng, và không cần kết nối để mở. Nếu bạn bị hỏi mật khẩu mỗi lần, điện thoại của bạn đang xóa bộ nhớ ứng dụng ở nền — hãy kiểm tra cài đặt tối ưu hóa pin.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Chụp một tấm ảnh",
          summary: "Thao tác cốt lõi: chụp, đóng dấu, tải lên.",
          keywords: ["chụp", "máy ảnh", "ảnh", "capture", "camera", "photo", "shoot"],
          body: [
            steps(
              "Mở ứng dụng và chọn dự án bạn đang làm.",
              "Chạm nút chụp.",
              "Chờ chỉ báo vị trí ổn định — ở ngoài trời thường chỉ mất một khoảnh khắc.",
              "Căn khung hình và chụp.",
              "Thêm ghi chú nếu tấm ảnh cần giải thích. Ghi chú có thể tìm kiếm được về sau.",
            ),
            h("Những gì được in lên ảnh"),
            ul(
              "Ngày và giờ, được đối chiếu với giờ mạng thay vì đồng hồ điện thoại.",
              "Tọa độ GPS.",
              "Địa chỉ đường phố mà tọa độ đó tra ra.",
              "Tên bạn và dự án, nếu mẫu có bao gồm.",
              "Một mã ảnh duy nhất mà bất kỳ ai cũng xác thực được.",
            ),
            h("Bắt vị trí cho tốt"),
            ul(
              "Hãy bước ra ngoài hoặc tránh xa thép và bê tông trước khi chụp.",
              "Cho điện thoại vài giây sau khi mở ứng dụng — lần định vị đầu tiên là chậm nhất.",
              "Trong nhà và dưới hầm, hãy chấp nhận địa chỉ chỉ gần đúng. Tọa độ vẫn được ghi lại.",
            ),
            warn(
              "Bạn không thể thay đổi thời gian, tọa độ hay địa chỉ trên một ảnh chụp sau khi đã chụp. Nếu một tấm ảnh sai, hãy xóa nó và chụp tấm khác.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Quay video",
          summary: "Video có xác thực với cùng dấu đóng như ảnh, tối đa theo độ dài đoạn của gói bạn dùng.",
          keywords: ["video", "quay", "đoạn phim", "độ dài", "record", "clip", "film", "length"],
          body: [
            p(
              "Video hoạt động y hệt như chụp ảnh: cùng hình mờ, cùng thời gian và vị trí đã xác thực, cùng cách tải lên. Nó là một nút riêng trên màn hình chụp.",
            ),
            h("Độ dài đoạn phim theo gói"),
            ul(
              "Free — đoạn 30 giây, có trong ba ngày đầu sau khi không gian làm việc được tạo.",
              "Plus — video dài không bị cắt cho một người.",
              "Business, Crew 10, Crew 25 — đoạn tối đa 3 phút trên mọi chỗ ngồi.",
              "Các gói Giao hàng — bao gồm đoạn 3 phút.",
            ),
            h("Quay cho tốt"),
            ul(
              "Hãy giữ khung hình trên bất cứ thứ gì quan trọng trong trọn ba giây. Lia máy nhanh làm video vô dụng khi dùng làm bằng chứng.",
              "Hãy thuyết minh những gì bạn đang cho xem. Phần âm thanh là một phần của hồ sơ.",
              "Hãy quay thành các đoạn ngắn, có chủ đích thay vì một lượt đi dài — chúng tải lên nhanh hơn và dễ tìm lại hơn nhiều.",
            ),
            note(
              "Tệp video rất lớn. Trên kết nối tính theo dung lượng, hãy để các đoạn phim tải lên qua Wi-Fi vào cuối ngày thay vì qua mạng di động.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Chụp khi không có sóng",
          summary: "Làm việc ở bất cứ đâu — ảnh chụp xếp hàng trên thiết bị và tải lên khi có sóng trở lại.",
          keywords: [
            "ngoại tuyến",
            "hàng chờ",
            "không có sóng",
            "đồng bộ",
            "tải lên",
            "tầng hầm",
            "offline",
            "queue",
            "no signal",
            "sync",
            "upload",
            "basement",
          ],
          body: [
            p(
              "GeoCliks được xây dựng cho những nơi không có sóng. Mọi thứ đều hoạt động ngoại tuyến trừ việc tải lên. Không có chế độ đặc biệt nào phải bật.",
            ),
            h("Điều gì xảy ra khi ngoại tuyến"),
            ul(
              "Máy ảnh, hình mờ và GPS đều hoạt động bình thường — GPS không cần kết nối dữ liệu.",
              "Mỗi ảnh chụp được ghi xuống thiết bị kèm thời điểm chụp thật.",
              "Màn hình hàng chờ cho thấy những gì đang đợi tải lên.",
              "Ngay khi có kết nối, hàng chờ tự làm rỗng ở nền.",
            ),
            h("Thời gian trên một ảnh chụp ngoại tuyến"),
            p(
              "Thời gian được ghi là lúc bạn bấm nút, không phải lúc tấm ảnh cuối cùng được tải lên. Tải lên muộn không làm yếu hồ sơ.",
            ),
            warn(
              "Đừng xóa và cài lại ứng dụng khi vẫn còn ảnh chụp trong hàng chờ. Bất cứ thứ gì chưa tải lên sẽ mất. Hãy kiểm tra hàng chờ đã rỗng trước.",
            ),
            h("Nếu hàng chờ bị kẹt"),
            ul(
              "Mở ứng dụng và để nó ở trên màn hình khoảng một phút trên kết nối tốt.",
              "Xác nhận rằng bạn vẫn đang đăng nhập.",
              "Kiểm tra điện thoại không ở chế độ tiết kiệm dữ liệu hay tiết kiệm pin, vì chúng chặn truyền dữ liệu nền.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Đưa ảnh chụp vào đúng dự án",
          summary: "Chọn dự án trước khi chụp, hoặc chuyển ảnh sang sau.",
          keywords: ["dự án", "gán", "chuyển", "sắp xếp", "project", "assign", "move", "file", "organise"],
          body: [
            p(
              "Mọi ảnh chụp đều thuộc về một dự án. Dự án quyết định báo cáo, bản đồ và những gì khách hàng của bạn nhìn thấy, nên chọn đúng từ đầu sẽ đỡ phải dọn dẹp về sau.",
            ),
            h("Trước khi bạn chụp"),
            steps(
              "Mở danh sách dự án.",
              "Chạm vào công việc bạn đang làm. Nó giữ nguyên lựa chọn cho tới khi bạn đổi.",
              "Chụp như bình thường — mọi thứ tự vào đúng chỗ đó.",
            ),
            h("Chuyển một ảnh chụp sau khi đã chụp"),
            p(
              "Manager, admin và chủ sở hữu có thể chuyển ảnh chụp giữa các dự án từ Không gian nhóm. Chuyển một tấm ảnh chỉ thay đổi nó thuộc dự án nào; thời gian, vị trí, địa chỉ và mã ảnh đều không bị động tới, và hồ sơ xác thực vẫn kiểm tra đạt.",
            ),
            note(
              "Nếu đội của bạn cứ đưa ảnh vào nhầm công việc, nguyên nhân thường gặp là lựa chọn dự án còn sót lại từ hôm trước. Hãy nhắc họ kiểm tra tên dự án trên màn hình chụp mỗi buổi sáng.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Hình mờ và cài đặt",
      articles: [
        {
          slug: "watermark-templates",
          title: "Mẫu hình mờ",
          summary: "Quyết định những gì xuất hiện trên mọi tấm ảnh, và đặt logo của bạn lên đó.",
          keywords: [
            "hình mờ",
            "mẫu",
            "logo",
            "thương hiệu",
            "dấu đóng",
            "trường thông tin",
            "watermark",
            "template",
            "branding",
            "stamp",
            "fields",
          ],
          body: [
            p(
              "Mẫu hình mờ là bố cục của dấu đóng được in vào ảnh bạn chụp. Nó được đặt cho từng không gian làm việc, nên ảnh của mọi thành viên đội đều ra đồng nhất.",
            ),
            h("Các trường bạn có thể hiện hoặc ẩn"),
            ul(
              "Ngày và giờ",
              "Tọa độ GPS",
              "Địa chỉ đường phố",
              "Tên dự án",
              "Tên người chụp",
              "Một ghi chú tự do hoặc số công việc",
              "Logo công ty của bạn",
            ),
            h("Chỉnh sửa mẫu"),
            steps(
              "Trong Không gian nhóm, mở Hình mờ.",
              "Chọn một mẫu hoặc tạo mẫu mới.",
              "Bật tắt các trường bạn muốn và tải logo của bạn lên.",
              "Lưu lại. Các ảnh chụp mới dùng mẫu đó ngay; ảnh đã có giữ nguyên dấu đóng lúc chúng được chụp.",
            ),
            warn(
              "Thay đổi một mẫu không bao giờ thay đổi những tấm ảnh đã chụp. Đây là cố ý — một dấu đóng có thể viết lại về sau thì không phải là bằng chứng.",
            ),
            h("Bạn được bao nhiêu mẫu"),
            ul(
              "Free — 2 mẫu.",
              "Plus trở lên — tất cả các mẫu cộng với logo riêng của bạn.",
            ),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Đổi mẫu ngay tại hiện trường",
          summary: "Dùng một dấu đóng khác cho một khách hàng hoặc một loại công việc.",
          keywords: [
            "đổi",
            "đổi mẫu",
            "mặc định",
            "theo dự án",
            "switch",
            "change template",
            "default",
            "per project",
          ],
          body: [
            p(
              "Phần lớn các đội dùng một mẫu cho mọi việc. Khi bạn cần một mẫu khác — một khách hàng muốn số công việc riêng của họ trên mọi tấm ảnh, hoặc một cuộc kiểm tra cần thêm trường thông tin — hãy đổi ngay trên màn hình chụp.",
            ),
            steps(
              "Trên màn hình chụp, chạm vào tên mẫu.",
              "Chọn mẫu bạn muốn.",
              "Chụp. Lựa chọn này giữ nguyên cho tới khi bạn đổi lại.",
            ),
            note(
              "Không gian làm việc của bạn có một mẫu mặc định, được dùng bất cứ khi nào không ai chọn khác đi. Manager đặt mẫu mặc định trong Không gian nhóm, mục Hình mờ.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Chất lượng ảnh và bộ nhớ",
          summary: "Cân bằng giữa chất lượng ảnh với tốc độ tải lên và bộ nhớ điện thoại.",
          keywords: [
            "chất lượng",
            "độ phân giải",
            "bộ nhớ",
            "kích thước",
            "ảnh gốc",
            "dữ liệu",
            "quality",
            "resolution",
            "storage",
            "size",
            "original",
            "data",
          ],
          body: [
            h("Cài đặt chất lượng"),
            p(
              "Chất lượng cao hơn nghĩa là bằng chứng tốt hơn và tải lên chậm hơn. Với phần lớn công việc ghi hình, mức tiêu chuẩn là đủ — nó vẫn đọc được khi in trong một bản báo cáo. Hãy nâng lên khi chi tiết nhỏ quan trọng, như vết nứt mảnh hay số sê-ri.",
            ),
            h("Giữ lại ảnh gốc"),
            p(
              "Bạn có thể để ứng dụng lưu một bản gốc không hình mờ vào thư viện ảnh của máy cùng với bản đã đóng dấu. Hữu ích khi bạn cần một ảnh sạch cho mục đích khác. Nó làm dung lượng mỗi ảnh chụp chiếm trên điện thoại tăng khoảng gấp đôi.",
            ),
            h("Giải phóng dung lượng"),
            ul(
              "Các ảnh chụp đã tải lên xong có thể xóa khỏi thiết bị — chúng vẫn nằm trong Không gian nhóm.",
              "Video mới là thứ làm đầy điện thoại. Hãy xóa các đoạn đã tải lên trước.",
              "Đừng bao giờ xóa bất cứ thứ gì còn nằm trong hàng chờ tải lên.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Thông báo",
          summary: "Ứng dụng báo cho bạn những gì, và cách làm nó bớt ồn.",
          keywords: ["thông báo", "cảnh báo", "tắt tiếng", "notifications", "push", "alerts", "silence", "mute"],
          body: [
            h("GeoCliks gửi những gì"),
            ul(
              "Tải lên xong, hoặc tải lên thất bại và cần bạn để ý.",
              "Một tin nhắn trực tiếp hoặc một thông báo chung từ văn phòng của bạn.",
              "Một tuyến đường được giao cho bạn, và các nhắc nhở khi bạn tới gần một điểm dừng.",
              "Lời mời và thay đổi vai trò.",
            ),
            h("Giảm bớt thông báo"),
            steps(
              "Mở Cài đặt trong ứng dụng.",
              "Mở Thông báo.",
              "Tắt các nhóm bạn không cần.",
            ),
            note(
              "Nếu bạn là tài xế, hãy để bật thông báo tuyến đường. Bộ phận điều phối dùng chúng để báo cho bạn khi một điểm dừng được thêm vào chuyến đang chạy.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Cài đặt ứng dụng",
          summary: "Ngôn ngữ, giao diện, đường lưới, tiếng chụp và những thứ còn lại.",
          keywords: [
            "cài đặt",
            "ngôn ngữ",
            "giao diện",
            "chế độ tối",
            "đường lưới",
            "âm thanh",
            "settings",
            "language",
            "theme",
            "dark mode",
            "gridlines",
            "sound",
          ],
          body: [
            h("Ngôn ngữ"),
            p(
              "GeoCliks có sẵn ở 11 ngôn ngữ. Lựa chọn của bạn chỉ áp dụng cho thiết bị này, nên trong cùng một không gian làm việc, mỗi thành viên đội có thể đọc ứng dụng bằng ngôn ngữ riêng của mình. Hãy để ở mặc định của không gian làm việc để đi theo lựa chọn của văn phòng.",
            ),
            h("Giao diện"),
            p(
              "Có cả giao diện sáng và tối. Giao diện tối dễ chịu cho mắt hơn khi ngồi trong xe tải ban đêm; giao diện sáng dễ đọc hơn dưới nắng gắt.",
            ),
            h("Hỗ trợ khi chụp"),
            ul(
              "Đường lưới — một lưới căn khung trong khung ngắm. Nó không bị chụp vào ảnh.",
              "Tiếng chụp — hãy tắt ở những nơi cần yên tĩnh. Một số quốc gia bắt buộc theo luật và ở đó không tắt được.",
              "Lưu ảnh gốc — giữ một bản không hình mờ trên thiết bị.",
            ),
            h("Hồ sơ của bạn"),
            p(
              "Tên, ảnh và mật khẩu của bạn nằm trong Hồ sơ. Tên bạn xuất hiện trên ảnh chụp khi mẫu có bao gồm nó, nên hãy để tên mà đội của bạn nhận ra được.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
