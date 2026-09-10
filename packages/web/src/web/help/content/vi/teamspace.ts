import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Không gian nhóm",
  summary:
    "Không gian làm việc chung nơi ảnh của đội đổ về, và nơi văn phòng biến chúng thành dự án, báo cáo và liên kết chia sẻ.",
  icon: "Users",
  sections: [
    {
      title: "Không gian làm việc của bạn",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Tổng quan Không gian nhóm",
          summary: "Không gian làm việc là gì, những gì đổ vào đó, và ai thấy được phần nào.",
          keywords: [
            "không gian làm việc",
            "tổ chức",
            "bảng điều khiển",
            "dùng chung",
            "workspace",
            "organisation",
            "org",
            "dashboard",
            "shared",
          ],
          body: [
            p(
              "Không gian nhóm là một không gian làm việc chung cho một công ty. Mọi ảnh và video đội của bạn chụp trên điện thoại đều tải lên đó, và tất cả những ai có quyền truy cập đều thấy cùng một thư viện từ ứng dụng web, ứng dụng máy tính hoặc điện thoại của họ.",
            ),
            p(
              "Bạn không phải tự tay chuyển thứ gì vào không gian nhóm. Ngay khi một ảnh chụp tải lên xong, nó đã ở trong đó, kèm theo thời gian đã xác thực, vị trí GPS và địa chỉ.",
            ),
            h("Trong một không gian nhóm có gì"),
            ul(
              "Thư viện ảnh và video, ảnh mới nhất lên đầu.",
              "Dự án — các công việc, công trình hoặc khách hàng mà bạn nhóm ảnh chụp vào.",
              "Đội của bạn: thành viên, vai trò của họ, và mỗi người thấy được dự án nào.",
              "Mẫu hình mờ, để mọi điện thoại đóng dấu ảnh chụp theo cùng một cách.",
              "Báo cáo và bản xuất bạn đã tạo, cùng mọi liên kết chia sẻ bạn đã trao đi.",
              "Tuyến đường giao hàng, nếu bạn dùng phần Giao hàng.",
            ),
            h("Ai thấy được gì"),
            p(
              "Owner, Admin và Manager thấy toàn bộ không gian làm việc. Thành viên Field chỉ thấy các dự án họ được giao — ảnh của chính họ cộng với mọi thứ khác trong các dự án đó. Đó là lý do chính để đưa công việc vào dự án thay vì để rời rạc.",
            ),
            note(
              "Không gian nhóm thuộc gói Business trở lên. Ở Free và Plus bạn vẫn có đầy đủ chức năng chụp, đóng hình mờ và xác thực, nhưng không gian làm việc chỉ có mình bạn.",
            ),
            see(
              "teamspace/create-a-project",
              "teamspace/roles-and-permissions",
              "plans-billing/compare-plans",
            ),
          ],
        },
        {
          slug: "create-a-project",
          title: "Tạo một dự án",
          summary:
            "Nhóm ảnh chụp theo công việc, công trình hoặc khách hàng để bộ lọc, báo cáo và quyền của đội đều khớp nhau.",
          keywords: [
            "dự án",
            "công việc",
            "công trình",
            "khách hàng",
            "thư mục",
            "project",
            "job",
            "site",
            "client",
            "folder",
          ],
          body: [
            p(
              "Một dự án là một khối chứa ảnh chụp — thường là một công việc, một công trình hoặc một khách hàng. Dự án là thứ mà báo cáo được dựng lên từ đó, là thứ thành viên Field được cấp quyền truy cập, và là thứ mà bản đồ cùng chế độ xem trước và sau nhóm theo.",
            ),
            h("Tạo một dự án"),
            steps(
              "Trong ứng dụng web, mở Dự án và chọn Dự án mới.",
              "Đặt tên cho nó. Đó là trường bắt buộc duy nhất.",
              "Tùy chọn thêm mã công việc, tên khách hàng, nhãn địa điểm và địa chỉ đường phố.",
              "Thêm ngành nghề và ghi chú nội bộ nếu đội của bạn có dùng.",
              "Lưu lại. Dự án có ngay trong bộ chọn dự án của ứng dụng di động.",
            ),
            h("Các trường thông tin và công dụng của chúng"),
            table(
              ["Trường", "Công dụng"],
              [
                ["Tên", "Cách dự án hiển thị ở mọi nơi. Tối đa 90 ký tự."],
                ["Mã", "Số công việc hoặc lệnh sản xuất của riêng bạn. Tìm kiếm được."],
                ["Khách hàng", "Công việc làm cho ai. Hữu ích khi bạn xuất dữ liệu."],
                ["Nhãn địa điểm", "Một cái tên dễ hiểu cho công trình, như \"Bãi phía Bắc\"."],
                ["Địa chỉ", "Địa chỉ công trình. Dùng để đưa dự án vào giữa bản đồ."],
                ["Ngành nghề", "Cách phân nhóm của riêng bạn, như \"Lợp mái\" hay \"Kiểm tra\"."],
                ["Ghi chú", "Bối cảnh nội bộ. Không bao giờ hiện trên liên kết chia sẻ."],
              ],
            ),
            h("Trạng thái dự án"),
            p(
              "Mọi dự án đều ở trạng thái đang hoạt động, tạm dừng, hoàn thành hoặc đã lưu trữ. Trạng thái không thay đổi gì về quyền truy cập hay lưu trữ — nó ở đó để một công việc đã xong thôi làm rối danh sách. Hãy lọc theo trạng thái ở đầu trang Dự án.",
            ),
            note(
              "Tạo một dự án cần vai trò Manager trở lên. Thành viên Field có thể chụp vào các dự án họ được giao nhưng không tạo được dự án mới.",
            ),
            warn(
              "Mỗi gói bao gồm một số lượng dự án nhất định. Nếu bạn chạm giới hạn, bạn sẽ được đề nghị nâng cấp thay vì được phép tạo một dự án không nằm trong gói.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Duyệt và lọc ảnh",
          summary:
            "Thu hẹp hàng nghìn ảnh chụp xuống còn vài tấm bạn cần, theo dự án, người chụp, thẻ, ngày hoặc chữ.",
          keywords: [
            "tìm kiếm",
            "lọc",
            "thư viện",
            "thẻ",
            "tìm",
            "search",
            "filter",
            "library",
            "gallery",
            "tag",
            "find",
          ],
          body: [
            p(
              "Thư viện ảnh hiển thị mọi ảnh chụp trong không gian làm việc, mới nhất lên đầu. Các bộ lọc chồng lên nhau — hãy đặt bao nhiêu tùy thích và tất cả cùng có hiệu lực.",
            ),
            h("Các bộ lọc"),
            ul(
              "Dự án — chỉ những ảnh chụp thuộc dự án đó.",
              "Thành viên — chỉ những ảnh chụp do một người chụp.",
              "Thẻ — chung, trước, sau, sự cố, lúc đến, lúc rời, lấy hàng hoặc giao hàng.",
              "Khoảng ngày — ảnh chụp trong khoảng giữa hai ngày, tính theo thời điểm chụp, không phải thời điểm tải lên.",
              "Tìm kiếm — khớp với địa chỉ, ghi chú trên ảnh chụp, và mã ảnh.",
            ),
            h("Tìm theo mã ảnh"),
            p(
              "Nếu một khách hàng đọc cho bạn một mã ảnh từ hình mờ, hãy dán nó vào ô tìm kiếm. Nó sẽ tìm đúng tấm ảnh đó, nhanh hơn nhiều so với cuộn tới ngày cần tìm.",
            ),
            h("Làm việc với một nhóm đã chọn"),
            p(
              "Hãy chọn nhiều ảnh chụp để chuyển chúng sang một dự án, gắn thẻ, dựng một báo cáo chỉ từ những ảnh đó, hoặc xóa chúng. Xóa cần vai trò Manager trở lên.",
            ),
            note(
              "Bộ lọc ngày dùng thời điểm tấm ảnh được chụp. Một ảnh chụp nằm trong hàng chờ ngoại tuyến hai ngày vẫn được lọc vào đúng ngày đội có mặt tại công trình.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Chế độ xem bản đồ",
          summary: "Xem mọi ảnh chụp dưới dạng ghim, và xác nhận đội đã ở đúng nơi giấy tờ ghi.",
          keywords: ["bản đồ", "ghim", "vị trí", "tọa độ", "map", "gps", "pins", "location", "coordinates"],
          body: [
            p(
              "Chế độ xem bản đồ đặt các ảnh chụp của bạn theo vị trí GPS đã ghi. Nó trả lời được câu hỏi mà một lưới ảnh không trả lời nổi: công việc có được làm đúng nơi cần làm không?",
            ),
            h("Cách dùng"),
            steps(
              "Mở Bản đồ từ thanh điều hướng của không gian làm việc.",
              "Áp dụng chính các bộ lọc dự án, thành viên, thẻ và ngày mà bạn dùng trong thư viện.",
              "Bấm vào một ghim để xem ảnh chụp, địa chỉ và thời gian chính xác của nó.",
              "Phóng to vào một cụm để tách các ghim nằm cách nhau vài mét.",
            ),
            h("Khi một ghim trông có vẻ sai"),
            ul(
              "Trong nhà, dưới tầng hầm hay giữa các tòa nhà cao tầng, độ chính xác GPS giảm xuống. Ghim có thể lệch vài chục mét dù tấm ảnh là thật.",
              "Địa chỉ được tra ra từ tọa độ, nên một phép định vị tệ sẽ cho ra một tên đường nghe hợp lý nhưng sai.",
              "Những ảnh chụp khi quyền vị trí bị từ chối thì hoàn toàn không có ghim và sẽ không xuất hiện trên bản đồ.",
            ),
            note(
              "Bạn có thể xuất phần đang chọn trên bản đồ thành tệp KMZ và mở nó trong Google Earth, đó thường là thứ mà các đơn vị hạ tầng và khách hàng nhà nước yêu cầu.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "So sánh trước và sau",
          summary: "Đặt hai ảnh chụp cạnh nhau để cho thấy sự thay đổi mà bạn được trả tiền để tạo ra.",
          keywords: ["trước", "sau", "so sánh", "tiến độ", "before", "after", "compare", "progress", "slider"],
          body: [
            p(
              "Chế độ so sánh ghép hai ảnh chụp từ cùng một dự án và hiển thị chúng cùng nhau, mỗi tấm kèm thời gian và địa chỉ đã xác thực của riêng nó. Đây là cách nhanh nhất để chứng minh công việc đã hoàn thành.",
            ),
            h("Thiết lập"),
            steps(
              "Gắn thẻ Trước cho tấm ảnh đầu tiên, trong ứng dụng hoặc trong thư viện web.",
              "Gắn thẻ Sau cho tấm ảnh ở trạng thái hoàn thiện.",
              "Mở dự án và chọn chế độ xem Trước và sau.",
              "Chọn cặp bạn muốn nếu có nhiều hơn một cặp được gắn thẻ.",
            ),
            h("Có được một cặp ảnh sạch sẽ"),
            ul(
              "Hãy đứng ở gần đúng cùng một chỗ và cầm điện thoại ở cùng độ cao cho cả hai tấm.",
              "Hãy đưa một điểm mốc cố định vào cả hai khung hình — một cánh cửa, một cây cột, một góc tường.",
              "Hãy chụp tấm Sau từ cùng khoảng cách; phóng to thay vì bước tới sẽ làm thay đổi phối cảnh.",
            ),
            note(
              "Bố cục trước và sau là một trong các bố cục báo cáo, nên khi cặp ảnh đã được gắn thẻ, bạn có thể đưa thẳng nó vào một tệp PDF gửi khách hàng.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Chia sẻ công việc",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Báo cáo và xuất dữ liệu",
          summary: "Biến một nhóm ảnh chụp đã lọc thành PDF, bảng tính Excel, tệp ZIP hoặc KMZ.",
          keywords: [
            "báo cáo",
            "xuất dữ liệu",
            "tải xuống",
            "pdf",
            "excel",
            "xlsx",
            "zip",
            "kmz",
            "export",
            "report",
            "download",
          ],
          body: [
            p(
              "Một báo cáo là ảnh chụp nhanh của một nhóm ảnh trong một tệp mà bạn có thể gửi đi. Hãy dựng nhóm đó bằng bộ lọc trước, rồi mới xuất — những gì đang trên màn hình chính là những gì vào tệp.",
            ),
            h("Dựng một báo cáo"),
            steps(
              "Lọc thư viện xuống những ảnh chụp bạn muốn, hoặc mở một dự án.",
              "Chọn Xuất, rồi đặt tiêu đề cho báo cáo.",
              "Chọn bố cục: lưới, chi tiết, trước và sau, hoặc bản đồ.",
              "Chọn định dạng: PDF, Excel, ZIP hoặc KMZ.",
              "Tạo báo cáo. Tệp được dựng trên máy chủ và xuất hiện trong danh sách báo cáo của bạn để tải xuống, hoặc tải lại về sau.",
            ),
            h("Nên dùng định dạng nào"),
            table(
              ["Định dạng", "Dùng cho"],
              [
                ["PDF", "Tài liệu gửi khách hàng. Ảnh có hình mờ, đã dàn trang và đánh số trang."],
                ["Excel", "Mỗi ảnh chụp một dòng với thời gian, tọa độ, địa chỉ, thẻ và ghi chú."],
                ["ZIP", "Các tệp ảnh gốc, để chuyển giao sang một hệ thống khác."],
                ["KMZ", "Mở các vị trí chụp trong Google Earth hoặc phần mềm GIS."],
              ],
            ),
            h("Các bố cục"),
            ul(
              "Lưới — nhiều ảnh trên mỗi trang, phù hợp nhất khi số lượng lớn.",
              "Chi tiết — mỗi trang một ảnh chụp kèm khối dữ liệu đầy đủ.",
              "Trước và sau — các cặp đã gắn thẻ đặt cạnh nhau.",
              "Bản đồ — các vị trí chụp được vẽ lên bản đồ, kèm một mục lục ảnh.",
            ),
            warn(
              "Định dạng xuất phụ thuộc vào gói của bạn. Gói Free tạo ra một tệp PDF tối đa 20 ảnh; Excel, ZIP và KMZ bắt đầu từ Plus. Nếu một định dạng không nằm trong gói, bạn sẽ được báo trước khi tệp được dựng, chứ không phải sau.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Liên kết chia sẻ",
          summary:
            "Gửi một ảnh chụp cho người không có tài khoản, và thu lại liên kết khi bạn đã xong việc.",
          keywords: [
            "chia sẻ",
            "liên kết",
            "khách hàng",
            "công khai",
            "thu hồi",
            "hết hạn",
            "share",
            "link",
            "url",
            "client",
            "public",
            "revoke",
            "expiry",
          ],
          body: [
            p(
              "Liên kết chia sẻ là một địa chỉ web hiển thị một ảnh chụp — nội dung, thời gian đã xác thực, vị trí GPS và địa chỉ của nó — cho bất kỳ ai mở nó. Không cần tài khoản, không cần ứng dụng, không cần đăng nhập.",
            ),
            h("Tạo một liên kết"),
            steps(
              "Mở ảnh chụp trong ứng dụng web.",
              "Chọn Chia sẻ.",
              "Tùy chọn đặt số ngày hết hạn. Để trống nếu muốn một liên kết không hết hạn.",
              "Sao chép liên kết và gửi đi.",
            ),
            h("Quản lý liên kết"),
            ul(
              "Mọi liên kết đều được liệt kê trong không gian làm việc kèm thời điểm tạo và số lần đã được mở.",
              "Hãy thu hồi một liên kết bất cứ lúc nào. Nó ngừng hoạt động ngay lập tức với tất cả những ai đang giữ.",
              "Yêu cầu chia sẻ một ảnh chụp vốn đã có liên kết đang hoạt động sẽ trả về liên kết hiện có thay vì tạo liên kết thứ hai.",
            ),
            h("Liên kết chia sẻ không để lộ những gì"),
            ul(
              "Các ảnh chụp, dự án hay đội ngũ khác của bạn.",
              "Ghi chú nội bộ của dự án.",
              "Bất cứ điều gì về không gian làm việc, gói hay thanh toán của bạn.",
            ),
            warn(
              "Hãy coi một liên kết là công khai. Bất kỳ ai được chuyển tiếp liên kết đó đều mở được cho tới khi bạn thu hồi hoặc nó hết hạn.",
            ),
            note(
              "Liên kết chia sẻ là tính năng của gói trả phí. Nếu không thấy nút Chia sẻ, hãy kiểm tra gói của bạn.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Đội của bạn",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Mời đội của bạn",
          summary: "Thêm người bằng email hoặc mã QR, và đưa họ vào đúng dự án ngay từ ngày đầu.",
          keywords: [
            "mời",
            "thêm thành viên",
            "chỗ ngồi",
            "đội",
            "invite",
            "add member",
            "seat",
            "qr",
            "onboard",
            "crew",
          ],
          body: [
            p(
              "Thành viên tham gia bằng lời mời. Bạn gửi một lời mời, họ chấp nhận, và ảnh họ chụp bắt đầu đổ về không gian nhóm của bạn.",
            ),
            h("Gửi một lời mời"),
            steps(
              "Mở Nhóm và chọn Mời.",
              "Nhập email công việc của họ.",
              "Chọn một vai trò. Field là mặc định và phù hợp với phần lớn thành viên đội.",
              "Tích chọn những dự án họ nên có quyền truy cập ngay từ lần đăng nhập đầu tiên.",
              "Gửi đi. Họ nhận được một email kèm liên kết đưa họ vào không gian làm việc của bạn.",
            ),
            h("Mời một người đang đứng cạnh bạn"),
            p(
              "Mọi lời mời đang chờ đều có kèm một mã QR. Hãy hiện nó lên màn hình, nhờ họ quét bằng máy ảnh điện thoại, và họ vào thẳng trang chấp nhận mà bạn không phải gõ địa chỉ của họ. Rất tiện với một đội đang ở công trình cùng bạn.",
            ),
            h("Chỗ ngồi"),
            p(
              "Mỗi gói bao gồm một số chỗ ngồi. Một lời mời đang chờ giữ một chỗ ngồi, nên năm lời mời trên ba chỗ ngồi sẽ bị từ chối thay vì để mọi người chấp nhận rồi vượt quá gói. Nếu bạn hết chỗ ngồi, hãy thu hồi một lời mời sẽ không được chấp nhận, xóa một thành viên đã rời đi, hoặc nâng cấp.",
            ),
            h("Nếu lời mời không tới nơi"),
            ul(
              "Nhờ họ kiểm tra thư rác, và xác nhận lại địa chỉ bạn đã dùng.",
              "Hãy kiểm tra danh sách đang chờ — nếu lời mời có ở đó, hãy gửi lại hoặc dùng mã QR thay thế.",
              "Một lời mời gắn với địa chỉ email nó được gửi tới; chấp nhận bằng một địa chỉ khác sẽ không được.",
            ),
            note("Mời và xóa thành viên cần vai trò Admin trở lên."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Vai trò và quyền hạn",
          summary: "Owner, Admin, Manager và Field — mỗi vai trò làm được gì, và nên cho ai vai trò nào.",
          keywords: [
            "vai trò",
            "quyền hạn",
            "truy cập",
            "chủ sở hữu",
            "role",
            "permission",
            "admin",
            "manager",
            "field",
            "access",
            "owner",
          ],
          body: [
            p(
              "Có bốn vai trò. Mỗi thành viên có đúng một vai trò, và nó quyết định họ thấy gì và thay đổi được gì. Tên vai trò được giữ nguyên tiếng Anh trong ứng dụng: Owner, Admin, Manager và Field.",
            ),
            table(
              ["Vai trò", "Làm được gì"],
              [
                [
                  "Owner",
                  "Mọi thứ, bao gồm thanh toán và đổi gói. Mỗi không gian làm việc có một Owner, và vai trò này không thể bị tước đi.",
                ],
                [
                  "Admin",
                  "Mời và xóa thành viên, đổi vai trò, quản lý dự án, mẫu và bản xuất.",
                ],
                [
                  "Manager",
                  "Tạo và sửa dự án, xóa ảnh chụp, gửi thông báo chung, dựng báo cáo. Không quản lý được thành viên.",
                ],
                [
                  "Field",
                  "Chụp ảnh, và chỉ thấy các dự án được giao. Không truy cập được phần nhóm, lời mời hay thanh toán.",
                ],
              ],
            ),
            h("Nên giao vai trò nào cho ai"),
            ul(
              "Đội trực tiếp làm việc: Field.",
              "Tổ trưởng hoặc người phụ trách công trình lo sắp xếp công việc: Manager.",
              "Nhân viên văn phòng lo tiếp nhận người mới và làm hồ sơ cho khách hàng: Admin.",
              "Hãy để vai trò Owner cho người trả tiền.",
            ),
            h("Đổi vai trò"),
            steps(
              "Mở Nhóm.",
              "Chọn thành viên.",
              "Chọn vai trò mới. Nó có hiệu lực vào lần tiếp theo ứng dụng của họ liên lạc với máy chủ.",
            ),
            h("Xóa một người"),
            p(
              "Xóa một thành viên sẽ lấy đi quyền truy cập của họ. Nó không xóa công việc của họ: ảnh, video và dấu vết kiểm toán đằng sau chúng vẫn ở lại trong không gian nhóm, và đó chính là ý nghĩa của việc giữ bằng chứng trong một không gian làm việc thay vì trên một chiếc điện thoại.",
            ),
            warn(
              "Bạn không thể xóa Owner của không gian làm việc, và bạn không thể tự xóa chính mình. Chỉ Owner mới xóa được một Admin khác, nên hai Admin không thể xóa lẫn nhau.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Tin nhắn và thông báo chung",
          summary: "Trao đổi với một thành viên đội, hoặc gửi một thông báo tới tất cả cùng lúc.",
          keywords: [
            "tin nhắn",
            "trò chuyện",
            "thông báo chung",
            "thông báo",
            "message",
            "chat",
            "broadcast",
            "announcement",
            "notify",
            "push",
          ],
          body: [
            p(
              "Tin nhắn là các cuộc trao đổi một đối một giữa những người trong cùng không gian làm việc. Chúng đến dưới dạng thông báo đẩy trên điện thoại, nên bạn không phải chạy theo đội qua một ứng dụng nhắn tin cá nhân.",
            ),
            h("Nhắn tin cho ai đó"),
            steps(
              "Mở Tin nhắn.",
              "Chọn người từ danh bạ của không gian làm việc.",
              "Gõ và gửi. Bạn có thể đính kèm một ảnh chụp gần đây để nói rõ bạn đang nhắc tới chuyện gì.",
            ),
            h("Thông báo chung"),
            p(
              "Một thông báo chung gửi cùng một nội dung tới tất cả mọi người trong không gian làm việc cùng lúc. Nó được chuyển tới như một tin nhắn bình thường trong cuộc trao đổi riêng của từng người, nên các câu trả lời quay về riêng cho bạn thay vì biến thành một cuộc tranh cãi tập thể.",
            ),
            steps(
              "Mở Tin nhắn và chọn Thông báo chung.",
              "Tùy chọn đính kèm một dự án, để mọi người biết nội dung liên quan tới công việc nào.",
              "Viết nội dung và gửi. Bạn sẽ thấy nó đã tới bao nhiêu người.",
            ),
            note(
              "Gửi thông báo chung cần vai trò Manager trở lên. Nhắn tin một đối một thì mọi người trong không gian làm việc đều dùng được.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Chuẩn chung",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Thư viện mẫu hình mờ",
          summary:
            "Đặt dấu đóng mà mọi điện thoại trong không gian làm việc đều dùng, để ảnh chụp trả về đồng nhất.",
          keywords: [
            "hình mờ",
            "mẫu",
            "thương hiệu",
            "logo",
            "dấu đóng",
            "mặc định",
            "watermark",
            "template",
            "brand",
            "stamp",
            "default",
          ],
          body: [
            p(
              "Một mẫu hình mờ quyết định những gì được in vào góc của mỗi ảnh chụp: những trường nào xuất hiện, khối thông tin nằm ở đâu, và có logo của bạn trên đó hay không. Mẫu nằm trong không gian làm việc chứ không nằm trên một thiết bị, nên những gì bạn đặt ở đây là những gì cả đội đóng dấu.",
            ),
            h("Tạo một mẫu"),
            steps(
              "Mở Mẫu trong cài đặt không gian làm việc.",
              "Chọn Mẫu mới và đặt tên theo trường hợp sử dụng, không phải theo khách hàng — \"Tiến độ công trình\" bền hơn \"Công việc Northline\".",
              "Tích chọn các trường cần hiện: ngày và giờ, tọa độ, địa chỉ, dự án, tên thành viên, mã ảnh, thời tiết, một dòng tùy chỉnh.",
              "Chọn góc đặt và kích thước, và tải lên một logo nếu bạn muốn.",
              "Lưu lại.",
            ),
            h("Mẫu mặc định"),
            p(
              "Một mẫu là mẫu mặc định của không gian làm việc. Thành viên mới nhận được nó tự động, và đó là mẫu điện thoại dùng cho tới khi có ai đó đổi. Bạn có thể đặt một mẫu mặc định khác bất cứ lúc nào; các ảnh chụp đã có không bị động tới.",
            ),
            h("Dọn dẹp"),
            ul(
              "Xóa một mẫu không làm thay đổi những ảnh chụp đã được đóng dấu bằng mẫu đó.",
              "Bạn không thể rơi vào tình trạng không có mẫu mặc định — nâng một mẫu lên làm mặc định sẽ hạ mẫu cũ xuống trong cùng một bước.",
              "Đội có thể chuyển giữa các mẫu của không gian làm việc trên điện thoại nhưng không sửa được chúng.",
            ),
            warn(
              "Gói Free bao gồm hai mẫu. Các gói trả phí cho phép bạn dựng bộ mẫu của riêng mình kèm logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
