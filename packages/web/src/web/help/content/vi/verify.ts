import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Xác thực",
  summary:
    "Mọi hình ảnh đều mang một mã ai cũng kiểm tra được, và một niêm phong cho biết nó có bị thay đổi hay không.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Kiểm tra một hình ảnh",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "Mã ảnh là gì?",
          summary:
            "Mã ngắn được in trên mọi hình ảnh, và trang công khai mà nó dẫn tới.",
          keywords: [
            "mã ảnh",
            "mã",
            "xác thực",
            "công khai",
            "code",
            "photo code",
            "verify",
            "public",
            "qr",
            "proof",
          ],
          body: [
            p(
              "Mỗi hình ảnh đều nhận một mã duy nhất, được in trong hình mờ và đi theo vào mọi báo cáo cùng mọi bản xuất. Mã trông như thế này:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "Mã là đầu mối dẫn tới đúng một hình ảnh đó. Bất kỳ ai có mã — khách hàng, công ty bảo hiểm, giám định viên, luật sư — đều tra được trên trang xác thực công khai mà không cần tài khoản, không cần ứng dụng, và không phải hỏi xin bạn bất cứ điều gì.",
            ),
            h("Mã xuất hiện ở những đâu"),
            ul(
              "In thẳng vào hình mờ trên ảnh hoặc video, nếu mẫu của bạn có bật mục này.",
              "Trên mọi trang của báo cáo PDF.",
              "Trong bản xuất Excel, mỗi hình ảnh một dòng.",
              "Là tên tệp của từng ảnh bên trong bản xuất ZIP.",
              "Trong email xác nhận giao hàng gửi cho người nhận.",
            ),
            h("Vì sao điều đó quan trọng"),
            p(
              "Một tấm ảnh đứng một mình thì không chứng minh được gì — ai cũng có thể chèn một mốc thời gian vào ảnh. Nhưng một mã dẫn tới hồ sơ độc lập nằm trên máy chủ của nhà cung cấp, hiển thị đúng thời điểm đó, đúng toạ độ đó và một niêm phong còn nguyên vẹn, lại là một loại bằng chứng khác hẳn. Người kiểm tra không cần phải tin lời bạn.",
            ),
            note(
              "Mã được viết theo dạng GC-XXXX-XXXX-XXXX, nhưng bạn có thể gõ chữ thường, gõ có khoảng trắng, bỏ phần đầu, hoặc dán nguyên đường liên kết xác thực. Tất cả đều dẫn về cùng một hình ảnh. Những hình ảnh chụp trước khi đổi tên sản phẩm mang mã TM-; các mã đó vẫn xác thực đúng như trước, và những mã đã in trong báo cáo cũ của bạn vẫn dùng được bình thường.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Xác thực một tấm ảnh",
          summary:
            "Cách bạn hoặc khách hàng kiểm tra một mã, và trang đó hiển thị những gì.",
          keywords: [
            "xác thực",
            "kiểm tra",
            "tra cứu",
            "khách hàng",
            "trang công khai",
            "verify",
            "check",
            "lookup",
            "client",
            "public page",
            "scan",
          ],
          body: [
            p(
              "Việc xác thực là công khai và chỉ mất vài giây. Bạn gửi mã cho khách hàng là họ tự kiểm tra được.",
            ),
            h("Kiểm tra một mã"),
            steps(
              "Vào geocliks.com/v rồi nhập mã, hoặc mở thẳng đường liên kết.",
              "Đọc hồ sơ: không gian nhóm sở hữu hình ảnh, thời điểm chụp, nơi chụp, và kết quả toàn vẹn.",
              "Đối chiếu với hình mờ trên tấm ảnh đang có trước mặt bạn. Hai bên phải khớp nhau hoàn toàn.",
            ),
            h("Trang đó hiển thị những gì"),
            table(
              ["Mục", "Ý nghĩa"],
              [
                ["Chủ sở hữu", "Không gian nhóm mà hình ảnh thuộc về."],
                ["Thời điểm chụp", "Giờ trên thiết bị vào lúc bấm máy."],
                [
                  "Thời điểm xác thực",
                  "Giờ máy chủ khi tệp về tới nơi. Không thể chỉnh từ điện thoại.",
                ],
                ["Vị trí", "Toạ độ, độ chính xác, và địa chỉ mà toạ độ đó dẫn tới."],
                ["Toàn vẹn", "Niêm phong còn khớp với tệp và dữ liệu đi kèm hay không."],
                ["Thiết bị", "Kiểu máy và nền tảng đã chụp."],
                ["Hash nội dung", "Dấu vân tay của phần dữ liệu ảnh."],
              ],
            ),
            h("Vì sao đôi khi ảnh bị ẩn đi"),
            p(
              "Hồ sơ thì luôn công khai, còn tấm ảnh thì không. Ảnh chỉ hiện ra khi không gian nhóm của bạn đang có một liên kết chia sẻ còn hiệu lực bao gồm hình ảnh đó. Đây là chủ ý: một mã lọt ra ngoài từ bản báo cáo thì không được kéo theo cả bức ảnh. Bạn thu hồi liên kết là ảnh trở lại trạng thái riêng tư, trong khi hồ sơ vẫn kiểm tra được.",
            ),
            note(
              "Mỗi lần xác thực công khai đều được ghi vào lịch sử của chính hình ảnh đó, nên bạn thấy được là mã đã bị đem đi tra. Nhiều lần mở trong vòng nửa giờ chỉ tính là một, để khách hàng bấm tải lại trang không làm trôi mất các sự kiện thật.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Đọc kết quả",
          summary:
            "Đã xác thực, chưa xác thực, bị giả mạo, và cảnh báo lệch giờ nghĩa là gì.",
          keywords: [
            "đã xác thực",
            "chưa xác thực",
            "bị giả mạo",
            "lệch giờ",
            "kết quả",
            "verified",
            "unverified",
            "tampered",
            "skew",
            "clock",
            "result",
            "warning",
          ],
          body: [
            p("Mỗi hình ảnh mang một trong ba kết quả toàn vẹn sau."),
            table(
              ["Kết quả", "Ý nghĩa"],
              [
                [
                  "Đã xác thực",
                  "Niêm phong khớp với tệp và dữ liệu đi kèm. Không có gì thay đổi kể từ lúc tải lên.",
                ],
                [
                  "Chưa xác thực",
                  "Chưa khẳng định được niêm phong. Thường là hình ảnh từ phiên bản ứng dụng cũ hoặc một lần tải lên dở dang — không phải dấu hiệu gian lận.",
                ],
                [
                  "Bị giả mạo",
                  "Niêm phong không khớp. Tệp hoặc dữ liệu đi kèm đã bị sửa sau khi tải lên.",
                ],
              ],
            ),
            h("Nguồn thời gian và độ lệch giờ"),
            p(
              "GeoCliks ghi lại hai mốc thời gian: giờ trên thiết bị lúc chụp ảnh, và giờ trên máy chủ lúc ảnh về tới nơi. Khoảng cách giữa hai mốc này được lưu lại.",
            ),
            ul(
              "Chênh nhau trong khoảng năm phút thì nguồn thời gian ghi là mạng — bình thường và đúng như mong đợi.",
              "Vượt quá mức đó thì ghi là thiết bị, và độ lệch được hiển thị ngay trên hồ sơ.",
            ),
            p(
              "Lệch nhiều không mặc nhiên là đáng ngờ. Một chiếc điện thoại nằm ngoại tuyến suốt hai ngày khi tải lên sẽ có khoảng cách thật, và độ lệch chính là lời giải thích. Điều nó nói lên là đồng hồ thiết bị và đồng hồ máy chủ đang không khớp nhau, và hồ sơ nói thẳng ra điều đó thay vì lặng lẽ chọn lấy một bên.",
            ),
            h("Giải thích kết quả cho khách hàng"),
            ul(
              "Đã xác thực: hồ sơ còn nguyên vẹn, và đây đúng là mục đích của việc xác thực.",
              "Chưa xác thực: hãy đưa bản gốc từ không gian nhóm của bạn, bản đó vẫn giữ đầy đủ lịch sử.",
              "Bị giả mạo: dừng lại và xem tệp đó đã đi qua những đâu. Đừng gửi tiếp cho ai.",
            ),
            warn(
              "Chỉnh sửa ảnh bên ngoài GeoCliks — cắt cúp, nén lại, cho chạy qua một ứng dụng nhắn tin — đều làm đổi phần dữ liệu ảnh và làm vỡ niêm phong. Hãy gửi bản gốc lấy từ không gian nhóm hoặc từ báo cáo, đừng bao giờ gửi bản đã đi vòng qua chỗ khác.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Niêm phong hoạt động ra sao",
          summary:
            "Ba thứ mà một thiết bị không thể tự tạo giả, nói bằng lời dễ hiểu.",
          keywords: [
            "niêm phong",
            "chữ ký",
            "bảo mật",
            "giả mạo",
            "hash",
            "signature",
            "hmac",
            "sha-256",
            "seal",
            "tamper",
            "security",
          ],
          body: [
            p(
              "Bạn không cần đọc bài này mới dùng được GeoCliks. Bài này dành cho người ngồi ở phía bên kia một vụ tranh chấp và muốn biết vì sao hồ sơ này đáng tin.",
            ),
            h("1. Hai chiếc đồng hồ, cả hai đều được ghi lại"),
            p(
              "Thời điểm chụp lấy từ thiết bị. Thời điểm xác thực do máy chủ GeoCliks đóng dấu khi tệp về tới nơi, và không một thiết lập nào trên điện thoại tác động được vào đó. Cả hai đều được giữ lại, kèm theo khoảng chênh lệch. Chỉnh đồng hồ điện thoại sẽ làm dịch thời điểm chụp và lộ ra ngay thành một khoảng cách so với giờ máy chủ.",
            ),
            h("2. Một dấu vân tay của tệp"),
            p(
              "Một chuỗi hash SHA-256 của phần dữ liệu ảnh đã tải lên được lưu cùng hồ sơ. Đổi một điểm ảnh thôi là chuỗi hash không còn khớp nữa. Đó là dấu vân tay chứ không phải bản sao — nó không nói lên bất cứ điều gì về nội dung bức ảnh.",
            ),
            h("3. Một chữ ký phủ lên toàn bộ hồ sơ"),
            p(
              "Mã ảnh, không gian nhóm sở hữu, người dùng đã chụp, nơi lưu trữ, cả hai mốc thời gian, toạ độ và hash nội dung được ghép lại theo một thứ tự cố định rồi ký bằng một khoá bí mật chỉ máy chủ nắm giữ. Sửa bất kỳ giá trị nào trong số đó về sau là chữ ký hết khớp, và đó chính là thứ tạo ra kết quả Bị giả mạo.",
            ),
            h("Điều này chứng minh được gì và không chứng minh được gì"),
            ul(
              "Nó chứng minh tệp và dữ liệu đi kèm không hề thay đổi kể từ khi GeoCliks nhận được.",
              "Nó chứng minh thời điểm tệp về tới nơi một cách độc lập với thiết bị.",
              "Nó không chứng minh chiếc điện thoại đã chĩa vào một cảnh có thật. Không hệ thống nào làm được điều đó. Thứ nó loại bỏ là khả năng lặng lẽ sửa hồ sơ về sau.",
            ),
            note(
              "Việc so khớp chữ ký được thực hiện trong thời gian cố định, nên không thể dò chính phép kiểm tra đó để suy ra khoá.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
