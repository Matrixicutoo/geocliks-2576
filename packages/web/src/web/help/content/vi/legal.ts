import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Quyền riêng tư & pháp lý",
  summary:
    "Ai sở hữu bằng chứng, dữ liệu được giữ trong bao lâu, và Chính sách quyền riêng tư cùng Điều khoản thực sự nói gì.",
  icon: "Scale",
  sections: [
    {
      title: "Dữ liệu của bạn",
      articles: [
        {
          slug: "data-ownership",
          title: "Ai sở hữu ảnh bạn chụp",
          summary:
            "Bạn giữ ảnh và video của mình. GeoCliks được phép làm gì với chúng, và không được phép làm gì.",
          keywords: [
            "sở hữu",
            "quyền",
            "giấy phép",
            "nội dung",
            "huấn luyện",
            "ownership",
            "own",
            "rights",
            "licence",
            "license",
            "content",
            "training",
          ],
          body: [
            p(
              "Bạn sở hữu mọi thứ bạn tải lên: ảnh, video, dữ liệu dự án, ghi chú. GeoCliks lưu trữ chúng và chứng minh chúng không bị thay đổi. Chúng không trở thành của chúng tôi chỉ vì được tải lên.",
            ),
            h("Chúng tôi được phép làm gì với dữ liệu đó"),
            p(
              "Điều khoản cấp cho GeoCliks một giấy phép hẹp — lưu trữ, truyền tải, đổi kích thước, lập chỉ mục và hiển thị ảnh bạn chụp — và chỉ để sản phẩm hoạt động được cho bạn và cho những người bạn chia sẻ. Đó là toàn bộ phạm vi.",
            ),
            ul(
              "Chúng tôi không bán nội dung của bạn.",
              "Chúng tôi không dùng nội dung đó để huấn luyện mô hình học máy cho bên thứ ba.",
              "Chúng tôi không cho ai xem nội dung đó nếu bạn chưa chia sẻ với họ.",
            ),
            h("Không gian làm việc sở hữu hồ sơ, không phải cá nhân"),
            p(
              "Ảnh chụp thuộc về không gian làm việc nơi chúng được chụp, không thuộc về thành viên đội đã bấm nút chụp. Điều này là cố ý, và đó là thứ giữ cho hồ sơ bằng chứng đứng vững:",
            ),
            ul(
              "Xóa một thành viên vẫn giữ lại mọi ảnh họ đã chụp, và giữ lại các mục của họ trong lịch sử chụp.",
              "Xóa một dự án không xóa ảnh chụp của dự án đó.",
              "Thành viên rời đi sẽ mất quyền truy cập nội dung của không gian làm việc nhưng không mang nội dung đó theo.",
            ),
            note(
              "Nếu bạn ở trong một không gian làm việc không thuộc sở hữu của mình và muốn thay đổi điều gì đó liên quan đến ảnh bạn chụp, hãy hỏi chủ sở hữu không gian làm việc trước. Với nội dung đó, GeoCliks hành động theo chỉ dẫn của không gian làm việc.",
            ),
            h("Bạn chịu trách nhiệm về điều gì"),
            p(
              "Bạn xác nhận mình có quyền chụp và tải lên những gì bạn tải lên — bao gồm mọi sự cho phép cần thiết từ những người, chủ tài sản hoặc đơn vị vận hành công trình xuất hiện trong khung hình. GeoCliks không kiểm tra điều đó thay bạn.",
            ),
            h("Niêm phong chứng minh điều gì, và không chứng minh điều gì"),
            p(
              "Mã ảnh, mã băm và chữ ký trên mỗi ảnh chụp khiến việc giả mạo mà không bị phát hiện trở nên khó khăn, và cho phép bất kỳ ai kiểm tra rằng tệp không thay đổi kể từ khi đến nơi. Chúng không biến GeoCliks thành công chứng viên, người khảo sát hay dịch vụ pháp lý, và không tòa án, công ty bảo hiểm hay khách hàng nào bắt buộc phải chấp nhận hồ sơ này. Quyết định đó luôn thuộc về họ.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Dữ liệu của bạn được giữ trong bao lâu",
          summary:
            "Điều gì còn lại sau khi xóa dự án, xóa thành viên, hủy gói và đóng không gian làm việc.",
          keywords: [
            "lưu giữ",
            "xóa",
            "giữ lại",
            "lưu trữ",
            "hủy",
            "đóng tài khoản",
            "retention",
            "delete",
            "deletion",
            "keep",
            "storage",
            "cancel",
            "close account",
            "erase",
          ],
          body: [
            p(
              "Nói ngắn gọn: nội dung của không gian làm việc được giữ chừng nào không gian làm việc còn tồn tại. Gần như không có gì khác xóa được nội dung đó.",
            ),
            table(
              ["Bạn làm gì", "Điều gì xảy ra với ảnh chụp"],
              [
                ["Xóa một dự án", "Ảnh chụp được giữ lại. Hồ sơ bằng chứng không gắn với dự án."],
                ["Xóa một thành viên", "Ảnh và các mục lịch sử của họ vẫn ở lại với không gian làm việc."],
                [
                  "Xóa tài khoản của chính bạn",
                  "Hồ sơ cá nhân và thông tin đăng nhập của bạn bị xóa. Ảnh bạn chụp trong không gian làm việc của người khác vẫn ở lại với không gian làm việc đó.",
                ],
                [
                  "Hủy gói trả phí",
                  "Không có gì bị xóa. Không gian làm việc chuyển về gói miễn phí và các tính năng trả phí ngừng hoạt động.",
                ],
                ["Đóng không gian làm việc", "Mọi thứ bị xóa, và không thể hoàn tác."],
              ],
            ),
            h("Hủy gói không phải là xóa dữ liệu"),
            p(
              "Hạ gói hoặc hủy gói không bao giờ hủy ảnh chụp. Bạn giữ lại lịch sử của mình, và mọi mã ảnh đã trao cho khách hàng vẫn tiếp tục tra cứu được trên trang xác thực công khai. Thứ bạn mất là các tính năng vượt quá giới hạn miễn phí — thêm chỗ ngồi, liên kết chia sẻ, các định dạng xuất phong phú hơn.",
            ),
            h("Đóng vĩnh viễn một không gian làm việc"),
            p(
              "Không có nút tự xóa cho cả một không gian làm việc, và đó là cố ý — quá dễ để phá hỏng một hồ sơ bằng chứng do sơ suất.",
            ),
            steps(
              "Chủ sở hữu không gian làm việc gửi email tới support@geocliks.com từ địa chỉ trên tài khoản chủ sở hữu.",
              "Hãy xuất mọi thứ bạn muốn giữ trước — PDF, Excel, ZIP hoặc KMZ.",
              "Chúng tôi xác nhận yêu cầu, sau đó xóa không gian làm việc và toàn bộ ảnh chụp của nó.",
            ),
            warn(
              "Xóa không gian làm việc là vĩnh viễn. Ảnh chụp, dự án, báo cáo và mã ảnh đều bị xóa, và mọi liên kết xác thực đã trao cho khách hàng sẽ ngừng hoạt động. Hãy xuất dữ liệu trước.",
            ),
            h("Bản sao lưu và nhật ký"),
            p(
              "Bản sao lưu và nhật ký bảo mật được giữ trong một khoảng thời gian giới hạn rồi được luân chuyển ra ngoài, nên một thao tác xóa có thể mất một chút thời gian để lan tới mọi bản sao.",
            ),
            h("Yêu cầu dữ liệu của chính bạn"),
            p(
              "Bạn có thể yêu cầu chúng tôi cho truy cập, sửa, xuất hoặc xóa dữ liệu cá nhân của bạn. Phần lớn dữ liệu đó bạn có thể tự thay đổi trong hồ sơ cá nhân và cài đặt thanh toán. Với những việc khác, hãy gửi email tới support@geocliks.com từ địa chỉ trên tài khoản của bạn.",
            ),
            see("legal/data-ownership", "plans-billing/cancel-or-downgrade", "legal/privacy-summary"),
          ],
        },
      ],
    },
    {
      title: "Các văn bản pháp lý",
      articles: [
        {
          slug: "privacy-summary",
          title: "Chính sách quyền riêng tư, nói dễ hiểu",
          summary:
            "GeoCliks thu thập gì, vì sao, ai khác được xem, và bạn có những lựa chọn nào. Đây là bản tóm tắt, không thay thế văn bản gốc.",
          keywords: [
            "quyền riêng tư",
            "chính sách",
            "dữ liệu cá nhân",
            "vị trí",
            "cookie",
            "quyền của bạn",
            "privacy",
            "policy",
            "gdpr",
            "personal data",
            "location",
            "cookies",
            "rights",
          ],
          body: [
            p(
              "Đây là cách đọc dễ hiểu của Chính sách quyền riêng tư để bạn biết trong đó có gì. Chính văn bản chính sách mới là thứ có giá trị, và nó nằm tại geocliks.com/privacy.",
            ),
            h("Những gì được thu thập"),
            ul(
              "Dữ liệu tài khoản: tên, email, mã băm của mật khẩu (không bao giờ là mật khẩu), ảnh đại diện, ngôn ngữ, giao diện, và khóa bí mật hai lớp nếu bạn bật.",
              "Dữ liệu không gian làm việc: tên không gian làm việc và dự án, khách hàng, địa điểm, vai trò, lời mời, mẫu và báo cáo.",
              "Ảnh chụp: ảnh hoặc video cùng dấu thời gian, tọa độ, địa chỉ đã tra cứu, thời điểm chụp trên thiết bị, mã ảnh, mã băm nội dung và chữ ký.",
              "Tin nhắn: tin nhắn trực tiếp và thông báo chung trong không gian làm việc, bao gồm cả ảnh đính kèm.",
              "Dữ liệu thiết bị: phiên bản ứng dụng, nền tảng, địa chỉ IP, mã thông báo push, nhật ký lỗi và các sự kiện sử dụng cơ bản.",
              "Dữ liệu thanh toán: gói của bạn, trạng thái đăng ký và các mã định danh mà đơn vị xử lý thanh toán trả về. Số thẻ không bao giờ đến chỗ chúng tôi.",
            ),
            note(
              "GeoCliks không muốn nhận số giấy tờ tùy thân do nhà nước cấp, thông tin sức khỏe hay các loại dữ liệu nhạy cảm khác. Hãy giữ chúng ngoài tên dự án, ghi chú và tin nhắn.",
            ),
            h("Vị trí và máy ảnh"),
            p(
              "Ứng dụng xin quyền máy ảnh và vị trí vì một ảnh chụp là ảnh cộng với nơi chốn và thời điểm. Bạn có thể từ chối một trong hai quyền và ứng dụng vẫn chạy được — nhưng một ảnh chụp không có vị trí thì không mang tọa độ và không có địa chỉ, mà đó lại là phần lớn thứ làm nên bằng chứng. Vị trí được đọc tại thời điểm chụp và để đặt ghim trên bản đồ của bạn. Không có theo dõi chạy nền.",
            ),
            h("Ai khác được xem"),
            p(
              "Dữ liệu của bạn không được bán và không bao giờ được chia sẻ cho mục đích quảng cáo. Một nhóm nhỏ nhà cung cấp xử lý dữ liệu theo chỉ dẫn của chúng tôi: dịch vụ lưu trữ đám mây, đơn vị xử lý thanh toán (và Apple với các giao dịch mua trong ứng dụng), nhà cung cấp email, dịch vụ thông báo đẩy, và nhà cung cấp bản đồ tra cứu địa chỉ.",
            ),
            h("Liên kết chia sẻ thực sự là công khai"),
            p(
              "Liên kết chia sẻ và trang xác thực hoạt động với bất kỳ ai giữ liên kết, không cần đăng nhập. Đó chính là mục đích của chúng. Thu hồi một liên kết sẽ chặn truy cập về sau nhưng không thể lấy lại bản sao ai đó đã tải xuống.",
            ),
            h("Quyền của bạn"),
            p(
              "Tùy theo luật địa phương, bạn có thể yêu cầu truy cập, sửa, xuất hoặc xóa dữ liệu cá nhân của mình, hạn chế hoặc phản đối một số hoạt động xử lý, và rút lại sự đồng ý. Hãy gửi email tới support@geocliks.com từ địa chỉ trên tài khoản của bạn. Ở Canada, bạn cũng có thể khiếu nại lên Văn phòng Ủy viên Quyền riêng tư; ở EEA hoặc Anh, lên cơ quan giám sát tại địa phương bạn.",
            ),
            h("Cookie"),
            p(
              "Chỉ những gì sản phẩm cần: giữ bạn ở trạng thái đã đăng nhập, ghi nhớ ngôn ngữ và giao diện, và giữ các ảnh chụp đang chờ trong khi bạn ngoại tuyến. Không có cookie quảng cáo hay theo dõi xuyên trang web.",
            ),
            note(
              "Chính sách quyền riêng tư và Điều khoản chỉ được công bố bằng tiếng Anh, và đó là cố ý. Dịch máy văn bản pháp lý có thể làm thay đổi ý nghĩa của nó.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Điều khoản dịch vụ, nói dễ hiểu",
          summary:
            "Nghĩa vụ của cả hai bên, những giới hạn GeoCliks nói rõ, và điều gì xảy ra nếu bạn ngừng thanh toán.",
          keywords: [
            "điều khoản",
            "thỏa thuận",
            "trách nhiệm",
            "sử dụng hợp lệ",
            "thanh toán",
            "chỗ ngồi",
            "terms",
            "tos",
            "agreement",
            "liability",
            "acceptable use",
            "billing",
            "seats",
          ],
          body: [
            p(
              "Đây là cách đọc dễ hiểu của Điều khoản. Văn bản tại geocliks.com/terms mới là thứ ràng buộc; bản này ở đây để không có điều gì trong đó khiến bạn bất ngờ.",
            ),
            h("Ai được sử dụng"),
            p(
              "Bạn phải từ 16 tuổi trở lên. Nếu bạn đăng ký cho một công ty, bạn đang xác nhận mình được phép chấp nhận Điều khoản thay mặt công ty đó.",
            ),
            h("Những giới hạn GeoCliks nói thẳng"),
            p(
              "Điều khoản nói thẳng một cách khác thường về những gì sản phẩm không thể hứa, và bạn nên đọc danh sách đó thay vì tự suy đoán:",
            ),
            ul(
              "GeoCliks không phải là công chứng viên, người khảo sát, phòng thí nghiệm hay dịch vụ pháp lý, và không có gì nó tạo ra là tư vấn pháp lý.",
              "Dấu thời gian đã xác thực qua mạng nghĩa là máy chủ của chúng tôi ghi lại thời điểm bản tải lên đến nơi — không phải là đồng hồ thiết bị đã đúng.",
              "Khi đồng hồ thiết bị lệch khỏi đồng hồ của chúng tôi quá vài phút, ảnh chụp được đánh dấu là tính giờ theo thiết bị.",
              "Độ chính xác vị trí phụ thuộc vào điện thoại và môi trường xung quanh; trong nhà và giữa các tòa nhà cao tầng, sai số có thể rất lớn.",
              "Ảnh chụp ngoại tuyến chỉ được niêm phong là đã xác thực khi đã tới máy chủ của chúng tôi.",
              "Không tòa án, công ty bảo hiểm, khách hàng hay cơ quan nào bắt buộc phải chấp nhận một hồ sơ GeoCliks.",
            ),
            h("Bạn đồng ý không làm gì"),
            ul(
              "Sử dụng Dịch vụ trái pháp luật, hoặc để quấy rối, theo dõi hay đe dọa bất kỳ ai.",
              "Tải lên nội dung bạn không có quyền tải lên.",
              "Thay đổi, làm giả hoặc gỡ bỏ dấu đóng, mã băm, chữ ký hay mã ảnh, hoặc mạo nhận tài liệu đã bị sửa là hồ sơ GeoCliks.",
              "Dò quét, gây quá tải hay can thiệp vào Dịch vụ, hoặc lách các giới hạn tần suất và hạn mức gói.",
              "Bán lại Dịch vụ, hoặc dùng chung một chỗ ngồi cho nhiều người.",
            ),
            warn(
              "Chỗ ngồi tính theo người, không theo thiết bị. Một thành viên đội có thể đăng nhập trên điện thoại, máy tính bảng và web — nhưng hai người dùng chung một tài khoản là vi phạm Điều khoản và làm lịch sử chụp trở nên vô dụng, vì mọi ảnh đều được quy cho người sở hữu chỗ ngồi.",
            ),
            h("Thanh toán"),
            p(
              "Các gói trả phí tự động gia hạn cho tới khi bị hủy. Đăng ký trên web do đơn vị xử lý thanh toán của chúng tôi thu tiền; đăng ký mua trong ứng dụng iOS do Apple thu tiền và theo quy trình hoàn tiền của Apple. Giá chưa gồm thuế. Các khoản phí đã trả không được hoàn lại trừ khi pháp luật yêu cầu.",
            ),
            p(
              "Nếu một lần thanh toán thất bại hoặc bạn hủy, không gian làm việc chuyển về gói miễn phí và các tính năng trả phí ngừng hoạt động. Ảnh chụp của bạn vẫn còn.",
            ),
            h("Tạm ngưng"),
            p(
              "Chúng tôi có thể tạm ngưng hoặc chấm dứt quyền truy cập nếu có vi phạm Điều khoản, nếu cách sử dụng gây nguy hại cho Dịch vụ hoặc cho khách hàng khác, hoặc khi pháp luật yêu cầu. Ở những trường hợp hợp lý, chúng tôi báo trước và cho bạn cơ hội xuất dữ liệu.",
            ),
            h("Khả dụng và trách nhiệm"),
            p(
              "Không có cam kết hợp đồng về thời gian hoạt động trừ khi bạn đã ký một thỏa thuận riêng bằng văn bản với chúng tôi. Dịch vụ được cung cấp nguyên trạng, và tổng trách nhiệm cho mọi khiếu nại được giới hạn ở số tiền bạn đã trả trong mười hai tháng trước khi khiếu nại phát sinh. Một số nơi không cho phép áp dụng vài phần trong đó, và tại đó các giới hạn này chỉ áp dụng trong phạm vi pháp luật cho phép.",
            ),
            h("Thay đổi"),
            p(
              "Các thay đổi quan trọng với Điều khoản hoặc Chính sách quyền riêng tư sẽ được thông báo trong ứng dụng hoặc qua email trước khi có hiệu lực. Thắc mắc về một trong hai văn bản xin gửi tới support@geocliks.com.",
            ),
            see("legal/data-ownership", "plans-billing/seats-and-billing", "verify/verify-results-explained"),
          ],
        },
      ],
    },
  ],
};
